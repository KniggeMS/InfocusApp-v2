# Set up logging
$logFile = "$PWD\dev-start.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Function to log messages
function LogMessage {
    param([string]$message, [string]$level = "INFO")
    $logEntry = "[$timestamp] [$level] $message"
    Write-Host $logEntry
    Add-Content -Path $logFile -Value $logEntry
}

# Clear old log
if (Test-Path $logFile) {
    Clear-Content -Path $logFile
}

LogMessage "Starting InFocus dev environment..."

# Step 1: Kill existing node processes
try {
    LogMessage "Killing existing Node processes..."
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 1
    LogMessage "Node processes killed successfully" "SUCCESS"
} catch {
    LogMessage "Error killing Node processes: $_" "ERROR"
}

# Step 2: Check if PostgreSQL is running
try {
    LogMessage "Checking PostgreSQL connection..."
    $pgProcess = Get-Process postgres -ErrorAction SilentlyContinue
    if ($pgProcess) {
        LogMessage "PostgreSQL is running" "SUCCESS"
    } else {
        LogMessage "PostgreSQL not found in processes (but may be in Docker)" "WARN"
    }
} catch {
    LogMessage "Warning checking PostgreSQL: $_" "WARN"
}

# Step 3: Start API
try {
    LogMessage "Starting API server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\api'; pnpm run dev"
    LogMessage "API window opened" "SUCCESS"
    Start-Sleep -Seconds 3
} catch {
    LogMessage "Error starting API: $_" "ERROR"
}

# Step 4: Start Web
try {
    LogMessage "Starting Web app..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\web'; pnpm dev"
    LogMessage "Web window opened" "SUCCESS"
} catch {
    LogMessage "Error starting Web: $_" "ERROR"
}

LogMessage "Development environment started!"
LogMessage "API: http://localhost:3000"
LogMessage "Web: http://localhost:3001"
LogMessage "Log file: $logFile"

Write-Host ""
Write-Host "=== Check both terminal windows for API and Web output ==="
Write-Host "=== Log file: $logFile ==="