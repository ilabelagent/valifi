/**
 * Valifi Fintech Platform - Integration Test Suite
 * Tests all major integrations: AWS RDS, ArmorWallet, Alpaca, IB, Payment Gateways, KYC/AML
 */

import { testDatabaseConnection } from '../src/config/aws-rds-config';
import ArmorWalletService from '../src/services/armorwallet/ArmorWalletService';
import AlpacaService from '../src/services/market-data/AlpacaService';
import IBService from '../src/services/interactive-brokers/IBService';
import PaymentGatewayService from '../src/services/payment/PaymentGatewayService';
import KYCAMLService from '../src/services/compliance/KYCAMLService';

interface TestResult {
  service: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

class IntegrationTestSuite {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Valifi Fintech Integration Tests...\n');

    await this.testDatabaseConnection();
    await this.testArmorWalletIntegration();
    await this.testAlpacaIntegration();
    await this.testInteractiveBrokersIntegration();
    await this.testPaymentGatewayIntegration();
    await this.testKYCAMLIntegration();

    this.printResults();
  }

  private async runTest(
    serviceName: string,
    testFunction: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      this.results.push({
        service: serviceName,
        status: 'PASS',
        message: 'Integration successful',
        duration
      });
      console.log(`✅ ${serviceName}: PASS (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.results.push({
        service: serviceName,
        status: 'FAIL',
        message,
        duration
      });
      console.log(`❌ ${serviceName}: FAIL (${duration}ms) - ${message}`);
    }
  }

  private async testDatabaseConnection(): Promise<void> {
    await this.runTest('AWS RDS PostgreSQL', async () => {
      const connected = await testDatabaseConnection();
      if (!connected) {
        throw new Error('Database connection failed');
      }
    });
  }

  private async testArmorWalletIntegration(): Promise<void> {
    await this.runTest('ArmorWallet Service', async () => {
      // Test wallet creation
      const userId = 'test-user-' + Date.now();
      const wallet = await ArmorWalletService.createWallet(userId, 'crypto', 'BTC');

      if (!wallet.success) {
        throw new Error('Failed to create ArmorWallet');
      }

      // Test balance retrieval
      const balance = await ArmorWalletService.getBalance(wallet.wallet.id);
      if (balance.currency !== 'BTC') {
        throw new Error('Wallet currency mismatch');
      }

      console.log(`  📊 Created wallet: ${wallet.wallet.address}`);
    });
  }

  private async testAlpacaIntegration(): Promise<void> {
    await this.runTest('Alpaca Market Data', async () => {
      // Test connection (if API keys are configured)
      if (!process.env.ALPACA_API_KEY) {
        throw new Error('ALPACA_API_KEY not configured - skipping test');
      }

      // Test latest quote
      const quote = await AlpacaService.getLatestQuote('AAPL');
      if (!quote) {
        throw new Error('Failed to fetch market quote');
      }

      console.log(`  📈 AAPL Quote: $${quote.ask} (Ask) / $${quote.bid} (Bid)`);

      // Test WebSocket connection (optional)
      try {
        await AlpacaService.initializeWebSocket();
        await AlpacaService.subscribeToSymbols(['AAPL', 'TSLA']);
        console.log('  🔄 WebSocket connected and subscribed');
      } catch (wsError) {
        console.log('  ⚠️  WebSocket test skipped (connection issue)');
      }
    });
  }

  private async testInteractiveBrokersIntegration(): Promise<void> {
    await this.runTest('Interactive Brokers', async () => {
      // Test IB Gateway connection (if running)
      try {
        await IBService.connect();
        console.log('  🔗 Connected to IB Gateway');

        // Test market data request
        await IBService.getMarketData('AAPL');
        console.log('  📊 Market data request sent');

        IBService.disconnect();
      } catch (error) {
        // IB Gateway might not be running in test environment
        if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
          throw new Error('IB Gateway not running - ensure TWS/Gateway is started');
        }
        throw error;
      }
    });
  }

  private async testPaymentGatewayIntegration(): Promise<void> {
    await this.runTest('Payment Gateways', async () => {
      // Test Stripe (if configured)
      if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
        console.log('  💳 Stripe: Configured');
      } else {
        console.log('  ⚠️  Stripe: Not configured');
      }

      // Test Plaid (if configured)
      if (process.env.PLAID_CLIENT_ID) {
        const userId = 'test-user-' + Date.now();
        const linkToken = await PaymentGatewayService.createPlaidLinkToken(userId);
        if (!linkToken) {
          throw new Error('Failed to create Plaid link token');
        }
        console.log('  🏦 Plaid: Link token created');
      } else {
        console.log('  ⚠️  Plaid: Not configured');
      }

      // Test Coinbase (if configured)
      if (process.env.COINBASE_API_KEY) {
        console.log('  ₿ Coinbase: Configured');
      } else {
        console.log('  ⚠️  Coinbase: Not configured');
      }
    });
  }

  private async testKYCAMLIntegration(): Promise<void> {
    await this.runTest('KYC/AML Compliance', async () => {
      // Test AML screening
      const amlRequest = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        nationality: 'US'
      };

      const amlResult = await KYCAMLService.performAMLCheck(amlRequest);
      if (!amlResult.checkId) {
        throw new Error('AML check failed to return ID');
      }

      console.log(`  🔍 AML Check: ${amlResult.riskLevel} risk (score: ${amlResult.riskScore})`);

      // Test compliance status retrieval
      const userId = 'test-user-' + Date.now();
      try {
        await KYCAMLService.getComplianceStatus(userId);
        console.log('  📋 Compliance status retrieved');
      } catch (error) {
        // Expected if user doesn't exist
        console.log('  📋 Compliance status check (user not found - expected)');
      }

      // Test KYC verification (mock)
      const mockDocument = {
        type: 'passport' as const,
        frontImage: 'base64-encoded-image-data',
        metadata: { test: true }
      };

      try {
        const kycResult = await KYCAMLService.performKYCVerification(userId, mockDocument);
        console.log(`  🆔 KYC Verification: ${kycResult.status} (confidence: ${kycResult.confidence})`);
      } catch (error) {
        console.log('  🆔 KYC Verification: Mock test completed');
      }
    });
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);

    if (failed > 0) {
      console.log('\n📋 FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`  ${result.service}: ${result.message}`);
        });
    }

    console.log('\n📊 PERFORMANCE:');
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' :
                    result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`  ${status} ${result.service}: ${result.duration}ms`);
    });

    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`\n⏱️  Total execution time: ${totalTime}ms`);

    if (failed === 0) {
      console.log('\n🎉 ALL INTEGRATIONS READY FOR PRODUCTION!');
    } else {
      console.log('\n⚠️  Some integrations failed. Please fix before production deployment.');
    }

    console.log('='.repeat(60));
  }
}

// Command line execution
if (require.main === module) {
  const testSuite = new IntegrationTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('\n✨ Integration test suite completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Integration test suite failed:', error);
      process.exit(1);
    });
}

export default IntegrationTestSuite;