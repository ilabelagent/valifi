import axios from 'axios';
import crypto from 'crypto';
import { pgPool } from '../../config/aws-rds-config';

interface KYCConfig {
  jumio: {
    apiToken: string;
    apiSecret: string;
    baseUrl: string;
  };
  chainalysis: {
    apiKey: string;
    baseUrl: string;
  };
  ofac: {
    apiKey: string;
    baseUrl: string;
  };
}

interface KYCDocument {
  type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement';
  frontImage: string; // Base64 encoded
  backImage?: string; // Base64 encoded
  metadata?: Record<string, any>;
}

interface KYCResult {
  verificationId: string;
  status: 'pending' | 'approved' | 'rejected' | 'review_required';
  confidence: number;
  extractedData: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    nationality?: string;
    address?: string;
  };
  flags: string[];
  riskScore: number;
}

interface AMLCheckRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality?: string;
  address?: string;
  transactionAmount?: number;
  walletAddress?: string;
}

interface AMLResult {
  checkId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  flags: string[];
  sanctionsMatch: boolean;
  pepMatch: boolean; // Politically Exposed Person
  adverseMediaMatch: boolean;
  walletRisk?: {
    riskLevel: string;
    categories: string[];
    totalReceived: number;
    totalSent: number;
  };
}

export class KYCAMLService {
  private config: KYCConfig;

  constructor() {
    this.config = {
      jumio: {
        apiToken: process.env.JUMIO_API_TOKEN || '',
        apiSecret: process.env.JUMIO_API_SECRET || '',
        baseUrl: process.env.JUMIO_BASE_URL || 'https://netverify.com/api/v4'
      },
      chainalysis: {
        apiKey: process.env.CHAINALYSIS_API_KEY || '',
        baseUrl: 'https://api.chainalysis.com'
      },
      ofac: {
        apiKey: process.env.OFAC_API_KEY || '',
        baseUrl: 'https://api.sanctions.io'
      }
    };
  }

  async performKYCVerification(userId: string, document: KYCDocument): Promise<KYCResult> {
    try {
      // Initialize KYC verification with Jumio
      const verificationResult = await this.initiateJumioVerification(userId, document);

      // Store KYC document record
      const documentQuery = `
        INSERT INTO kyc_documents (
          user_id, document_type, verification_status, verification_result
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const documentResult = await pgPool.query(documentQuery, [
        userId,
        document.type,
        verificationResult.status,
        JSON.stringify(verificationResult)
      ]);

      // Update user KYC status
      let kycLevel = 0;
      let kycStatus = 'pending';

      if (verificationResult.status === 'approved') {
        kycLevel = this.calculateKYCLevel(verificationResult);
        kycStatus = verificationResult.riskScore < 30 ? 'approved' : 'review_required';
      } else if (verificationResult.status === 'rejected') {
        kycStatus = 'rejected';
      }

      const userUpdateQuery = `
        UPDATE users
        SET kyc_status = $1, kyc_level = $2, identity_verified = $3,
            identity_verification_date = CASE WHEN $3 THEN CURRENT_TIMESTAMP ELSE NULL END,
            risk_score = $4
        WHERE id = $5
      `;

      await pgPool.query(userUpdateQuery, [
        kycStatus,
        kycLevel,
        verificationResult.status === 'approved',
        verificationResult.riskScore,
        userId
      ]);

      return verificationResult;
    } catch (error) {
      console.error('KYC verification error:', error);
      throw error;
    }
  }

  private async initiateJumioVerification(userId: string, document: KYCDocument): Promise<KYCResult> {
    try {
      const authHeader = Buffer.from(
        `${this.config.jumio.apiToken}:${this.config.jumio.apiSecret}`
      ).toString('base64');

      // Create Jumio transaction
      const transactionResponse = await axios.post(
        `${this.config.jumio.baseUrl}/initiate`,
        {
          customerInternalReference: userId,
          workflowId: 'KYC_WORKFLOW',
          userReference: userId,
          callbackUrl: `${process.env.BASE_URL}/api/kyc/callback`,
          successUrl: `${process.env.BASE_URL}/kyc/success`,
          errorUrl: `${process.env.BASE_URL}/kyc/error`
        },
        {
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const transactionToken = transactionResponse.data.transactionToken;

      // Upload document images
      await this.uploadDocumentToJumio(transactionToken, document);

      // Simulate verification result (in real implementation, this would be received via webhook)
      const mockResult: KYCResult = {
        verificationId: crypto.randomUUID(),
        status: 'pending',
        confidence: 0.95,
        extractedData: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          documentNumber: 'ABC123456',
          nationality: 'US'
        },
        flags: [],
        riskScore: 15
      };

      return mockResult;
    } catch (error) {
      console.error('Jumio verification error:', error);
      // Return a mock result for development
      return {
        verificationId: crypto.randomUUID(),
        status: 'pending',
        confidence: 0.0,
        extractedData: {},
        flags: ['verification_failed'],
        riskScore: 100
      };
    }
  }

  private async uploadDocumentToJumio(transactionToken: string, document: KYCDocument): Promise<void> {
    try {
      const authHeader = Buffer.from(
        `${this.config.jumio.apiToken}:${this.config.jumio.apiSecret}`
      ).toString('base64');

      // Upload front image
      await axios.put(
        `${this.config.jumio.baseUrl}/upload/${transactionToken}/front`,
        Buffer.from(document.frontImage, 'base64'),
        {
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'image/jpeg'
          }
        }
      );

      // Upload back image if provided
      if (document.backImage) {
        await axios.put(
          `${this.config.jumio.baseUrl}/upload/${transactionToken}/back`,
          Buffer.from(document.backImage, 'base64'),
          {
            headers: {
              'Authorization': `Basic ${authHeader}`,
              'Content-Type': 'image/jpeg'
            }
          }
        );
      }
    } catch (error) {
      console.error('Document upload error:', error);
    }
  }

  private calculateKYCLevel(result: KYCResult): number {
    let level = 0;

    // Basic verification (document uploaded and processed)
    if (result.status === 'approved') level = 1;

    // Medium verification (high confidence and extracted data)
    if (result.confidence > 0.8 && Object.keys(result.extractedData).length > 3) level = 2;

    // High verification (very high confidence, low risk, complete data)
    if (result.confidence > 0.95 && result.riskScore < 20 && result.flags.length === 0) level = 3;

    return level;
  }

  async performAMLCheck(request: AMLCheckRequest): Promise<AMLResult> {
    try {
      // Perform sanctions screening
      const sanctionsResult = await this.checkSanctionsList(request);

      // Perform PEP screening
      const pepResult = await this.checkPEPList(request);

      // Perform adverse media screening
      const adverseMediaResult = await this.checkAdverseMedia(request);

      // Wallet analysis if crypto address provided
      let walletRisk;
      if (request.walletAddress) {
        walletRisk = await this.analyzeWalletRisk(request.walletAddress);
      }

      // Calculate overall risk score
      const riskScore = this.calculateAMLRiskScore({
        sanctionsResult,
        pepResult,
        adverseMediaResult,
        walletRisk,
        transactionAmount: request.transactionAmount
      });

      const result: AMLResult = {
        checkId: crypto.randomUUID(),
        riskLevel: this.getRiskLevel(riskScore),
        riskScore,
        flags: [
          ...(sanctionsResult.match ? ['sanctions_match'] : []),
          ...(pepResult.match ? ['pep_match'] : []),
          ...(adverseMediaResult.match ? ['adverse_media'] : []),
          ...(walletRisk?.riskLevel === 'high' ? ['high_risk_wallet'] : [])
        ],
        sanctionsMatch: sanctionsResult.match,
        pepMatch: pepResult.match,
        adverseMediaMatch: adverseMediaResult.match,
        walletRisk
      };

      // Store AML check result
      const query = `
        INSERT INTO aml_monitoring (
          check_type, check_result, risk_factors, risk_score, flagged
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      await pgPool.query(query, [
        'comprehensive_screening',
        JSON.stringify(result),
        result.flags,
        riskScore,
        result.flags.length > 0
      ]);

      return result;
    } catch (error) {
      console.error('AML check error:', error);
      throw error;
    }
  }

  private async checkSanctionsList(request: AMLCheckRequest): Promise<{ match: boolean; details?: any }> {
    try {
      // OFAC sanctions list check
      const response = await axios.get(`${this.config.ofac.baseUrl}/search`, {
        headers: {
          'Authorization': `Bearer ${this.config.ofac.apiKey}`
        },
        params: {
          name: `${request.firstName} ${request.lastName}`,
          type: 'individual',
          fuzzy: true
        }
      });

      return {
        match: response.data.results.length > 0,
        details: response.data.results
      };
    } catch (error) {
      console.error('Sanctions check error:', error);
      return { match: false };
    }
  }

  private async checkPEPList(request: AMLCheckRequest): Promise<{ match: boolean; details?: any }> {
    try {
      // PEP database check (mock implementation)
      const pepScore = this.calculateNameSimilarity(
        `${request.firstName} ${request.lastName}`,
        'Known PEP Name' // This would be from a real PEP database
      );

      return {
        match: pepScore > 0.8,
        details: { similarity: pepScore }
      };
    } catch (error) {
      console.error('PEP check error:', error);
      return { match: false };
    }
  }

  private async checkAdverseMedia(request: AMLCheckRequest): Promise<{ match: boolean; details?: any }> {
    try {
      // Adverse media screening (mock implementation)
      // In reality, this would search news databases, sanctions lists, etc.
      return { match: false };
    } catch (error) {
      console.error('Adverse media check error:', error);
      return { match: false };
    }
  }

  private async analyzeWalletRisk(walletAddress: string): Promise<any> {
    try {
      // Chainalysis wallet screening
      const response = await axios.get(
        `${this.config.chainalysis.baseUrl}/v1/address/${walletAddress}`,
        {
          headers: {
            'X-API-Key': this.config.chainalysis.apiKey
          }
        }
      );

      return {
        riskLevel: response.data.risk,
        categories: response.data.categoryNames || [],
        totalReceived: response.data.totalReceivedUsd || 0,
        totalSent: response.data.totalSentUsd || 0
      };
    } catch (error) {
      console.error('Wallet analysis error:', error);
      return {
        riskLevel: 'unknown',
        categories: [],
        totalReceived: 0,
        totalSent: 0
      };
    }
  }

  private calculateAMLRiskScore(factors: {
    sanctionsResult: any;
    pepResult: any;
    adverseMediaResult: any;
    walletRisk?: any;
    transactionAmount?: number;
  }): number {
    let score = 0;

    // Sanctions match
    if (factors.sanctionsResult.match) score += 100;

    // PEP match
    if (factors.pepResult.match) score += 75;

    // Adverse media
    if (factors.adverseMediaResult.match) score += 50;

    // High-risk wallet
    if (factors.walletRisk?.riskLevel === 'high') score += 80;
    if (factors.walletRisk?.riskLevel === 'medium') score += 40;

    // Large transaction amount (>$10,000)
    if (factors.transactionAmount && factors.transactionAmount > 10000) score += 25;

    return Math.min(score, 100);
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private calculateNameSimilarity(name1: string, name2: string): number {
    // Simple Levenshtein distance calculation
    const a = name1.toLowerCase();
    const b = name2.toLowerCase();

    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[b.length][a.length];
    const maxLength = Math.max(a.length, b.length);
    return 1 - distance / maxLength;
  }

  async getComplianceStatus(userId: string): Promise<any> {
    try {
      const userQuery = `
        SELECT kyc_status, kyc_level, aml_status, risk_score,
               identity_verified, identity_verification_date
        FROM users WHERE id = $1
      `;

      const userResult = await pgPool.query(userQuery, [userId]);
      const user = userResult.rows[0];

      const documentsQuery = `
        SELECT document_type, verification_status, created_at
        FROM kyc_documents WHERE user_id = $1
        ORDER BY created_at DESC
      `;

      const documentsResult = await pgPool.query(documentsQuery, [userId]);

      const amlQuery = `
        SELECT check_type, risk_score, flagged, created_at
        FROM aml_monitoring WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const amlResult = await pgPool.query(amlQuery, [userId]);

      return {
        kyc: {
          status: user.kyc_status,
          level: user.kyc_level,
          identityVerified: user.identity_verified,
          verificationDate: user.identity_verification_date
        },
        aml: {
          status: user.aml_status,
          riskScore: user.risk_score,
          recentChecks: amlResult.rows
        },
        documents: documentsResult.rows
      };
    } catch (error) {
      console.error('Error getting compliance status:', error);
      throw error;
    }
  }

  async updateComplianceStatus(userId: string, updates: {
    kycStatus?: string;
    amlStatus?: string;
    riskScore?: number;
  }): Promise<void> {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      if (updates.kycStatus) {
        fields.push(`kyc_status = $${index++}`);
        values.push(updates.kycStatus);
      }

      if (updates.amlStatus) {
        fields.push(`aml_status = $${index++}`);
        values.push(updates.amlStatus);
      }

      if (updates.riskScore !== undefined) {
        fields.push(`risk_score = $${index++}`);
        values.push(updates.riskScore);
      }

      if (fields.length === 0) return;

      const query = `
        UPDATE users
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${index}
      `;

      values.push(userId);

      await pgPool.query(query, values);
    } catch (error) {
      console.error('Error updating compliance status:', error);
      throw error;
    }
  }
}

export default new KYCAMLService();