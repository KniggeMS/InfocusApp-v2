
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

async function testEndpoint(name: string, path: string, body: any) {
    console.log(`\n--- Testing ${name} ---`);
    try {
        const response = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Failed to test ${name}:`, error);
    }
}

async function main() {
    console.log('Starting AI Features Verification...');
    console.log('Ensure your API server is running on port 3000 with GEMINI_API_KEY set.');

    // 1. Test Recommendations
    await testEndpoint('Recommendations', '/ai/recommendations', {
        items: [
            { title: 'Inception', year: 2010, userRating: 5, isFavorite: true },
            { title: 'The Matrix', year: 1999, userRating: 5, isFavorite: true }
        ]
    });

    // 2. Test Avatar
    await testEndpoint('Avatar Generation', '/ai/avatar', {
        username: 'MovieBuff99'
    });

    // 3. Test Chat
    await testEndpoint('ChatBot', '/ai/chat', {
        message: 'Can you recommend a sci-fi movie?',
        context: [{ title: 'Interstellar', year: 2014, status: 'WATCHED' }]
    });

    // 4. Test Analysis
    await testEndpoint('Deep Insight', '/ai/analyze', {
        title: 'Parasite',
        plot: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        notes: 'I love social commentary and dark humor.'
    });

    console.log('\nVerification Complete.');
}

main();
