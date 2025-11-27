# Automated sync and restart script with named terminal windows and Docker check

$ErrorLogFile = "$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')_sync-errors.log"
$ProjectRoot = Get-Location

function Log-Error {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - ERROR: $Message" | Tee-Object -FilePath $ErrorLogFile -Append
    Write-Host $Message -ForegroundColor Red
}

function Log-Info {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - INFO: $Message" | Tee-Object -FilePath $ErrorLogFile -Append
    Write-Host $Message -ForegroundColor Green
}

function Check-DockerStatus {
    Log-Info "PREREQ: Checking Docker Desktop status..."
    
    # Führt einen einfachen Docker-Befehl aus und prüft den Exit Code
    docker version | Out-Null 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Docker Desktop ist NICHT gestartet oder der Docker-Daemon ist nicht erreichbar."
        Log-Error "Bitte starte Docker Desktop, warte, bis es vollständig initialisiert ist (grünes Icon), und starte das Skript erneut."
        exit 1
    }
    Log-Info "PREREQ: Docker-Daemon ist aktiv. Fortfahren mit dem Datenbank-Setup."
}

try {
    Log-Info "Starting sync and restart process..."
    
    # Prerequisite Check
    Log-Info "PREREQ: Ensure 'apps/api/.env' is configured with the correct DATABASE_URL!"
    
    # Step 1: Abort any pending merges
    Log-Info "Step 1: Checking for pending merges..."
    git merge --abort 2>$null
    
    # Step 2: Hard reset to origin/main
    Log-Info "Step 2: Hard resetting to origin/main..."
    git reset --hard origin/main
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Git reset failed"
        exit 1
    }
    
    # Step 3: Pull latest changes
    Log-Info "Step 3: Pulling latest from GitHub..."
    git pull origin main
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Git pull failed"
        exit 1
    }
    
    # --- Step 3.1: Automatische lokale Korrekturen (schema.prisma und package.json) ---
    Log-Info "Step 3.1: Applying local fixes (schema.prisma and API package.json)..."

    # 1. Korrektur der schema.prisma (Behebung P1012)
    $schemaPath = "$ProjectRoot\apps\api\prisma\schema.prisma"
    $contentSchema = Get-Content -Path $schemaPath | Out-String
    $replacementBlockSchema = @"
provider = "postgresql"
  url      = env("DATABASE_URL")
"@
    # Überprüft, ob der URL-Eintrag fehlt oder falsch ist
    if ($contentSchema -notmatch 'url\s*=\s*env\("DATABASE_URL"\)') {
        Log-Info "Fixing missing 'url' argument in schema.prisma..."
        (Get-Content -Path $schemaPath -Raw) -replace 'provider = "postgresql"', $replacementBlockSchema | Set-Content -Path $schemaPath
    }

    # 2. Korrektur der apps/api/package.json
    $packageJsonPath = "$ProjectRoot\apps\api\package.json"
    $cleanDevScript = '"dev": "ts-node src/index.ts"' # <--- Ziel: Nur noch den reinen Befehl
    $contentPackage = Get-Content -Path $packageJsonPath -Raw

    if ($contentPackage -notmatch [regex]::Escape($cleanDevScript)) {
        Log-Info "Adjusting API dev script for native PowerShell environment..."
        # Ersetzt alle Varianten des dev-Scripts durch den reinen ts-node Aufruf
        $contentPackage = $contentPackage -replace '"dev": ".*ts-node src/index.ts"', $cleanDevScript
        $contentPackage | Set-Content -Path $packageJsonPath
    }
    # --- ENDE Step 3.1 ---
    
    # Step 4: Install dependencies
    Log-Info "Step 4: Installing dependencies..."
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Log-Error "pnpm install failed"
        exit 1
    }
    
    # --- DOCKER PRÜFUNG ---
    Check-DockerStatus
    
    # Step 4.1: Start Docker Database Service (Verwendung der modernen 'docker compose' Syntax)
    Log-Info "Step 4.1: Starting PostgreSQL database via docker compose..."
    # Startet die DB im Hintergrund
    docker compose up -d postgres 2>$null
    
    Start-Sleep -Seconds 5 # Gib der Datenbank Zeit zum Hochfahren
    
    # Step 4.2: Run Prisma Synchronization (db push)
    Log-Info "Step 4.2: Synchronizing Prisma schema (db push)..."
    cd "$ProjectRoot\apps\api"
    # NEU: Verwenden von 'db push' anstelle von 'migrate dev'
    pnpm prisma db push --force-reset --skip-generate
    
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Prisma db push failed (Code: $LASTEXITCODE). Is the DATABASE_URL correct?"
        cd "$ProjectRoot" # Zurück ins Root
        exit 1
    }

    # Step 4.3: Generate Prisma Client (falls db push dies übersprungen hat)
    Log-Info "Step 4.3: Generating Prisma Client..."
    pnpm prisma generate
    
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Prisma generate failed."
        cd "$ProjectRoot" # Zurück ins Root
        exit 1
    }

    cd "$ProjectRoot" # Zurück ins Root-Verzeichnis
    
    Log-Info "Sync and DB preparation complete! Starting services..."
    
    # =================================================================================
    # KORRIGIERTER BLOCK FÜR VERBESSERTES LOGGING
    # =================================================================================
    
    # Step 5: Start API in named terminal window (MIT EXPLIZITER PORT-SETZUNG 3001)
    Log-Info "Step 5: Starting InFocus API..."
    
    # Befehl, der pnpm ausführt und den Exit-Code prüft.
    # WICHTIG: Verwenden Sie 'cmd /c', um die Ausführung zu steuern.
    $apiCommand = "cd '$ProjectRoot\apps\api' ; `$env:PORT=3001 ; pnpm run dev"
    
    $apiScript = @"
    `$Host.UI.RawUI.WindowTitle = 'InFocus API - Port 3001'
    
    # Führt den API-Startbefehl aus und speichert den Exit-Code
    ${apiCommand}
    
    if (`$LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "======================================================================" -ForegroundColor Red
        Write-Host "FEHLER: API-Server ist abgestürzt oder konnte nicht gestartet werden." -ForegroundColor Red
        Write-Host "Exit Code: ${LASTEXITCODE}" -ForegroundColor Red
        Write-Host "Drücken Sie eine Taste, um dieses Fenster zu schließen..." -ForegroundColor Red
        Read-Host
    }
"@
    
    # Startet ein neues PowerShell-Fenster mit dem Skript
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $apiScript
    
    # =================================================================================
    
    # Step 6: Start Web in named terminal window
    Log-Info "Step 6: Starting InFocus Web-App..."
    $webScript = @"
    `$Host.UI.RawUI.WindowTitle = 'InFocus Web - Port 3000'
    cd '$ProjectRoot\apps\web'
    `$env:NODE_ENV = 'development'
    pnpm dev
"@
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $webScript
    
    Log-Info "All services started. Check the new windows for status updates."

} catch {
    Log-Error "Ein schwerwiegender Fehler ist im Hauptskript aufgetreten: $($_.Exception.Message)"
    exit 1
}