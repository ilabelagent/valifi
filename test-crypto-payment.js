const RealCryptoService = require('./src/services/crypto/RealCryptoService.ts').default;

async function testCryptoPayment() {
  try {
    console.log('🔄 Testing crypto payment with real database...');

    // Create a crypto payment
    const payment = await RealCryptoService.createPayment(
      'c062bf2e-392a-4987-a9f7-dd2d853fa50a', // User ID from registration
      0.001, // Amount
      'BTC'  // Currency
    );

    console.log('✅ Crypto payment created successfully:');
    console.log(JSON.stringify(payment, null, 2));

    // Wait a bit for the simulation to process
    console.log('⏳ Waiting for blockchain confirmation simulation...');

    setTimeout(async () => {
      try {
        // Get payment status
        const paymentStatus = await RealCryptoService.getPayment(payment.id);
        console.log('📊 Payment status after processing:');
        console.log(JSON.stringify(paymentStatus, null, 2));
      } catch (error) {
        console.error('❌ Error getting payment status:', error.message);
      }
    }, 16000); // Wait for confirmation simulation

  } catch (error) {
    console.error('❌ Crypto payment test failed:', error.message);
  }
}

testCryptoPayment();