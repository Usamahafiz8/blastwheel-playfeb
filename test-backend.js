/**
 * Test Backend Service
 * 
 * Run this to test if your backend service is working:
 * node test-backend.js
 */

const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

console.log('🧪 Testing Backend Service...\n');
console.log(`Backend URL: ${BACKEND_URL}\n`);

// Test 1: Health check
console.log('Test 1: Health Check');
http.get(`${BACKEND_URL}/health`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('✅ Health check passed:', data);
        console.log('');
        
        // Test 2: Mint endpoint (will fail without proper data, but tests connection)
        console.log('Test 2: Mint Endpoint Connection');
        const postData = JSON.stringify({
            transactionData: {
                network: 'testnet',
                suiNetworkUrl: 'https://fullnode.testnet.sui.io:443',
                packageId: '0x3d061329bf5b7ed4cf8e0306b4bb809a977a65132ee1d412aaa8c0b598186ea5',
                module: 'blastwheelz',
                functionName: 'mint',
                arguments: {
                    collection: '0x4e53a9cda7c58569cdfb40f72506622f47728928eb7fba356faae551a7e379fa',
                    policy: '0xfdb7a33ba1ff862c08ac2709de9b7a332ef6dd2641d07f07e56ee0721d4ac36a',
                    name: 'Test NFT',
                    imageUrl: 'https://example.com/image.png',
                    projectUrl: 'https://example.com',
                    alloyRim: 'test',
                    frontBonnet: 'test',
                    backBonnet: 'test'
                },
                typeArguments: ['0x3d061329bf5b7ed4cf8e0306b4bb809a977a65132ee1d412aaa8c0b598186ea5::blastwheelz::Mustang']
            },
            playerId: 'test-player'
        });
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(`${BACKEND_URL}/mint`, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Mint endpoint is working!');
                    console.log('Response:', JSON.parse(data));
                } else if (res.statusCode === 400 || res.statusCode === 500) {
                    console.log('⚠️  Mint endpoint is reachable but returned error (this is OK for testing)');
                    console.log('Status:', res.statusCode);
                    console.log('Response:', data);
                } else {
                    console.log('❌ Unexpected status:', res.statusCode);
                    console.log('Response:', data);
                }
                console.log('\n✅ Backend service is running and accessible!');
                console.log('\nNext steps:');
                console.log('1. If using ngrok, copy your ngrok URL');
                console.log('2. In PlayFab: Content > Title Data > Add BACKEND_SERVICE_URL');
                console.log('3. Value: http://your-url:3000/mint (or https://your-ngrok-url.ngrok.io/mint)');
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Cannot connect to backend service!');
            console.log('Error:', error.message);
            console.log('\n💡 Make sure the backend is running:');
            console.log('   cd playfeb && npm start');
        });
        
        req.write(postData);
        req.end();
    });
}).on('error', (error) => {
    console.log('❌ Cannot connect to backend service!');
    console.log('Error:', error.message);
    console.log('\n💡 Make sure the backend is running:');
    console.log('   cd playfeb && npm start');
    console.log('\nOr set BACKEND_URL environment variable:');
    console.log('   BACKEND_URL=http://your-url:3000 node test-backend.js');
});

