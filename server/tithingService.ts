import { storage } from "./storage";
import { web3Service } from "./web3Service";
import { encryptionService } from "./encryptionService";
import type { InsertTithingHistory, TithingConfig, Charity } from "@shared/schema";

class TithingService {
  /**
   * Calculate tithe amount based on profit and percentage
   */
  calculateTithe(profit: string, percentage: string): string {
    const profitNum = parseFloat(profit);
    const percentageNum = parseFloat(percentage);
    
    if (profitNum <= 0 || percentageNum <= 0) {
      return "0";
    }
    
    const titheAmount = (profitNum * percentageNum) / 100;
    return titheAmount.toFixed(18);
  }

  /**
   * Execute tithe transaction - send funds to charity
   */
  async executeTithe(
    userId: string,
    amount: string,
    charityId: string,
    tradeId?: string,
    notes?: string
  ): Promise<InsertTithingHistory & { id: string; createdAt: Date }> {
    try {
      // Get charity details
      const charity = await storage.getCharity(charityId);
      if (!charity || !charity.isActive) {
        throw new Error("Charity not found or inactive");
      }

      // Get user's main wallet
      const wallets = await storage.getWalletsByUserId(userId);
      const mainWallet = wallets.find(w => w.isMain) || wallets[0];
      
      if (!mainWallet) {
        throw new Error("No wallet found for user");
      }

      // Check wallet balance
      const balance = parseFloat(mainWallet.balance || "0");
      const titheAmount = parseFloat(amount);
      
      if (balance < titheAmount) {
        throw new Error("Insufficient balance for tithe");
      }

      // Create pending tithe history record
      const tithingConfig = await storage.getTithingConfigByUserId(userId);
      const percentage = tithingConfig?.percentage || "10";
      
      let titheHistory = await storage.createTithingHistory({
        userId,
        charityId,
        amount,
        percentage,
        tradeId,
        status: "processing",
        notes,
      });

      try {
        // Decrypt private key and send transaction
        const privateKey = encryptionService.decrypt(
          mainWallet.privateKeyEncrypted || "",
          userId
        );

        const txResult = await web3Service.sendTransaction(
          privateKey,
          charity.walletAddress,
          amount,
          mainWallet.network || "ethereum"
        );

        // Update tithe history with transaction hash
        titheHistory = await storage.updateTithingHistory(titheHistory.id, {
          status: "completed",
          txHash: txResult.hash,
          completedAt: new Date(),
        });

        // Update charity totals
        await storage.updateCharityTotals(charityId, amount);

        // Record blockchain transaction
        await storage.createTransaction({
          walletId: mainWallet.id,
          type: "tithe",
          from: mainWallet.address,
          to: charity.walletAddress,
          value: amount,
          status: "confirmed",
          txHash: txResult.hash,
          network: mainWallet.network || "ethereum",
          metadata: {
            charityId,
            charityName: charity.name,
            tithingHistoryId: titheHistory.id,
          },
        });

        console.log(`✝️ Tithe executed: ${amount} sent to ${charity.name}`);
        return titheHistory;
      } catch (txError: any) {
        // Update tithe history to failed status
        await storage.updateTithingHistory(titheHistory.id, {
          status: "failed",
          notes: `Transaction failed: ${txError.message}`,
        });
        throw txError;
      }
    } catch (error: any) {
      console.error("Error executing tithe:", error);
      throw new Error(`Failed to execute tithe: ${error.message}`);
    }
  }

  /**
   * Auto-execute tithe on profitable trade
   */
  async autoExecuteTitheOnProfit(
    userId: string,
    tradeId: string,
    profit: string
  ): Promise<void> {
    try {
      // Get user's tithing config
      const config = await storage.getTithingConfigByUserId(userId);
      
      if (!config || !config.enabled || !config.autoExecute) {
        console.log(`Auto-tithe disabled for user ${userId}`);
        return;
      }

      const profitAmount = parseFloat(profit);
      const minThreshold = parseFloat(config.minProfitThreshold || "0");

      // Check if profit meets minimum threshold
      if (profitAmount <= minThreshold) {
        console.log(`Profit ${profit} below threshold ${minThreshold} for user ${userId}`);
        return;
      }

      // Calculate tithe amount
      const titheAmount = this.calculateTithe(profit, config.percentage);
      
      if (parseFloat(titheAmount) <= 0) {
        console.log(`Calculated tithe amount is 0 for user ${userId}`);
        return;
      }

      // Execute the tithe
      await this.executeTithe(
        userId,
        titheAmount,
        config.charityId,
        tradeId,
        `Auto-tithe from profitable trade (${config.percentage}% of ${profit})`
      );

      console.log(`✝️ Auto-tithe completed: ${titheAmount} (${config.percentage}% of ${profit})`);
    } catch (error: any) {
      console.error("Error in auto-tithe:", error);
      // Don't throw - log and continue to prevent trade flow interruption
    }
  }

  /**
   * Get tax deduction report for a given year
   */
  async getTaxReport(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const history = await storage.getTithingHistory(userId, {
      startDate,
      endDate,
      status: "completed",
    });

    // Calculate totals by charity
    const charitySummary: Record<string, any> = {};
    let totalGiven = 0;

    for (const record of history) {
      const amount = parseFloat(record.amount);
      totalGiven += amount;

      if (!charitySummary[record.charityId]) {
        const charity = await storage.getCharity(record.charityId);
        charitySummary[record.charityId] = {
          charityId: record.charityId,
          charityName: charity?.name || "Unknown",
          taxId: charity?.taxId || "",
          totalDonated: 0,
          transactionCount: 0,
          transactions: [],
        };
      }

      charitySummary[record.charityId].totalDonated += amount;
      charitySummary[record.charityId].transactionCount += 1;
      charitySummary[record.charityId].transactions.push({
        date: record.createdAt,
        amount: record.amount,
        txHash: record.txHash,
      });
    }

    return {
      year,
      userId,
      totalGiven: totalGiven.toFixed(2),
      transactionCount: history.length,
      charities: Object.values(charitySummary),
      generatedAt: new Date(),
    };
  }

  /**
   * Get giving impact dashboard data
   */
  async getImpactDashboard(userId: string) {
    // Get all-time tithing history
    const allHistory = await storage.getTithingHistory(userId, {
      status: "completed",
    });

    // Calculate totals
    let totalGiven = 0;
    const charityBreakdown: Record<string, { name: string; amount: number; count: number }> = {};
    const monthlyGiving: Record<string, number> = {};

    for (const record of allHistory) {
      const amount = parseFloat(record.amount);
      totalGiven += amount;

      // Charity breakdown
      if (!charityBreakdown[record.charityId]) {
        const charity = await storage.getCharity(record.charityId);
        charityBreakdown[record.charityId] = {
          name: charity?.name || "Unknown",
          amount: 0,
          count: 0,
        };
      }
      charityBreakdown[record.charityId].amount += amount;
      charityBreakdown[record.charityId].count += 1;

      // Monthly breakdown
      const monthKey = record.createdAt?.toISOString().substring(0, 7) || "unknown";
      monthlyGiving[monthKey] = (monthlyGiving[monthKey] || 0) + amount;
    }

    // Get current config
    const config = await storage.getTithingConfigByUserId(userId);
    const currentCharity = config ? await storage.getCharity(config.charityId) : null;

    return {
      totalGiven: totalGiven.toFixed(2),
      totalTransactions: allHistory.length,
      currentPercentage: config?.percentage || "0",
      currentCharity: currentCharity ? {
        id: currentCharity.id,
        name: currentCharity.name,
        description: currentCharity.description,
        category: currentCharity.category,
      } : null,
      charityBreakdown: Object.values(charityBreakdown),
      monthlyGiving: Object.entries(monthlyGiving).map(([month, amount]) => ({
        month,
        amount: amount.toFixed(2),
      })),
      autoTithingEnabled: config?.enabled && config?.autoExecute,
    };
  }

  /**
   * Generate annual giving statement (for tax purposes)
   */
  async generateAnnualStatement(userId: string, year: number): Promise<string> {
    const report = await this.getTaxReport(userId, year);
    const user = await storage.getUser(userId);

    // Generate formatted statement
    let statement = `
╔════════════════════════════════════════════════════════════╗
║          ANNUAL CHARITABLE GIVING STATEMENT                ║
║                    Tax Year ${year}                           ║
╚════════════════════════════════════════════════════════════╝

Donor Information:
  Name: ${user?.firstName || ""} ${user?.lastName || ""}
  Email: ${user?.email || ""}
  Statement Date: ${new Date().toLocaleDateString()}

Summary:
  Total Charitable Contributions: $${report.totalGiven}
  Number of Transactions: ${report.transactionCount}

Charitable Organizations:
`;

    for (const charity of report.charities) {
      statement += `
  ─────────────────────────────────────────────────
  Organization: ${charity.charityName}
  Tax ID (EIN): ${charity.taxId}
  Total Donated: $${charity.totalDonated.toFixed(2)}
  Number of Gifts: ${charity.transactionCount}
  
  Transactions:
`;
      for (const tx of charity.transactions) {
        statement += `    ${new Date(tx.date).toLocaleDateString()} - $${parseFloat(tx.amount).toFixed(2)} (TX: ${tx.txHash?.substring(0, 16)}...)\n`;
      }
    }

    statement += `
╔════════════════════════════════════════════════════════════╗
║  This statement is provided for tax deduction purposes.    ║
║  Please consult with your tax advisor for guidance.        ║
║                                                            ║
║  "Each of you should give what you have decided in your    ║
║   heart to give, not reluctantly or under compulsion,      ║
║   for God loves a cheerful giver." - 2 Corinthians 9:7     ║
╚════════════════════════════════════════════════════════════╝
`;

    return statement;
  }
}

export const tithingService = new TithingService();
