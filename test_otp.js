// Test script to verify OTP functionality
const fetch = require('node-fetch');

const API_BASE_URL = 'http://10.149.10.213:3000/api';

async function testOTP() {
    console.log('🧪 Testing OTP functionality...\n');
    
    const phoneNumber = '+919876543210';
    
    try {
        console.log('📱 Step 1: Requesting OTP...');
        const requestResponse = await fetch(`${API_BASE_URL}/auth/request-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber })
        });
        
        const requestData = await requestResponse.json();
        console.log('✅ OTP Request Response:', requestData);
        
        if (!requestData.success) {
            console.error('❌ OTP request failed');
            return;
        }
        
        const { otpId } = requestData;
        const otp = '123456'; // Mock OTP for testing
        
        console.log('\n📱 Step 2: Verifying OTP...');
        const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otpId, otp, phoneNumber })
        });
        
        const verifyData = await verifyResponse.json();
        console.log('✅ OTP Verify Response:', verifyData);
        
        if (verifyData.success) {
            console.log('\n🎉 OTP flow completed successfully!');
            console.log('🔑 JWT Token:', verifyData.token);
            
            // Test authenticated request
            console.log('\n📱 Step 3: Testing authenticated request...');
            const walletResponse = await fetch(`${API_BASE_URL}/wallet/balance`, {
                headers: {
                    'Authorization': `Bearer ${verifyData.token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            const walletData = await walletResponse.json();
            console.log('✅ Wallet Balance Response:', walletData);
            
        } else {
            console.error('❌ OTP verification failed');
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error.message);
    }
}

testOTP();
