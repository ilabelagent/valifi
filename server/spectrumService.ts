import { storage } from "./storage";
import { InsertSpectrumPlan } from "@shared/schema";

const SPECTRUM_PLANS: InsertSpectrumPlan[] = [
  {
    tier: "royal_bronze",
    name: "Royal Bronze",
    minimumStake: "1000",
    apy: "8.00",
    benefits: [
      "8% Annual Yield",
      "Daily Compound Interest",
      "24/7 Support",
      "Basic Dashboard Access",
    ],
    features: {
      compoundFrequency: "daily",
      supportLevel: "24/7",
      analyticsAccess: "basic",
      bonusProgram: "none",
      events: "none",
    },
    displayOrder: 1,
    isActive: true,
  },
  {
    tier: "royal_silver",
    name: "Royal Silver",
    minimumStake: "10000",
    apy: "12.00",
    benefits: [
      "12% Annual Yield",
      "Priority Support",
      "Advanced Analytics",
      "Quarterly Bonus",
      "VIP Events Access",
    ],
    features: {
      compoundFrequency: "daily",
      supportLevel: "priority",
      analyticsAccess: "advanced",
      bonusProgram: "quarterly",
      events: "vip",
    },
    displayOrder: 2,
    isActive: true,
  },
  {
    tier: "royal_gold",
    name: "Royal Gold",
    minimumStake: "100000",
    apy: "18.00",
    benefits: [
      "18% Annual Yield",
      "Dedicated Account Manager",
      "Premium Analytics Suite",
      "Monthly Bonus",
      "Exclusive Investment Opportunities",
      "Tax Optimization Tools",
    ],
    features: {
      compoundFrequency: "daily",
      supportLevel: "dedicated_manager",
      analyticsAccess: "premium",
      bonusProgram: "monthly",
      events: "exclusive",
      taxOptimization: true,
    },
    displayOrder: 3,
    isActive: true,
  },
  {
    tier: "kings_court",
    name: "King's Court",
    minimumStake: "5000000",
    apy: "25.00",
    benefits: [
      "25% Annual Yield",
      "White Glove Service",
      "Custom Investment Strategies",
      "Weekly Performance Reviews",
      "Private Investment Fund Access",
      "Estate Planning Services",
      "Global Network Access",
    ],
    features: {
      compoundFrequency: "daily",
      supportLevel: "white_glove",
      analyticsAccess: "enterprise",
      bonusProgram: "weekly",
      events: "private_fund",
      estatePlanning: true,
      globalNetwork: true,
    },
    displayOrder: 4,
    isActive: true,
  },
  {
    tier: "king_david_circle",
    name: "King David Circle",
    minimumStake: "10000000",
    apy: "35.00",
    benefits: [
      "35% Annual Yield",
      "Ultra-Premium Concierge",
      "Bespoke Portfolio Management",
      "Daily Strategy Sessions",
      "Exclusive Deal Flow",
      "Family Office Integration",
      "Legacy Planning",
      "Kingdom Network Governance Rights",
    ],
    features: {
      compoundFrequency: "daily",
      supportLevel: "ultra_premium_concierge",
      analyticsAccess: "bespoke",
      bonusProgram: "daily",
      events: "exclusive_deal_flow",
      familyOffice: true,
      legacyPlanning: true,
      governanceRights: true,
    },
    displayOrder: 5,
    isActive: true,
  },
];

export class SpectrumService {
  async seedPlans(): Promise<void> {
    console.log("Seeding Spectrum Investment Plans...");
    
    for (const planData of SPECTRUM_PLANS) {
      try {
        const existing = await storage.getSpectrumPlanByTier(planData.tier);
        
        if (!existing) {
          await storage.createSpectrumPlan(planData);
          console.log(`✓ Created plan: ${planData.name}`);
        } else {
          await storage.updateSpectrumPlan(existing.id, planData);
          console.log(`✓ Updated plan: ${planData.name}`);
        }
      } catch (error) {
        console.error(`Error seeding plan ${planData.name}:`, error);
      }
    }
    
    console.log("Spectrum Plans seeding complete!");
  }

  async calculateDailyCompoundInterest(): Promise<void> {
    console.log("Starting daily compound interest calculation...");
    
    try {
      const allSubscriptions = await storage.getAllActiveSpectrumSubscriptions?.();
      
      if (!allSubscriptions || allSubscriptions.length === 0) {
        console.log("No active subscriptions found.");
        return;
      }

      for (const subscription of allSubscriptions) {
        try {
          const lastUpdateDate = subscription.lastEarningsUpdate || subscription.subscribedAt;
          if (!lastUpdateDate) {
            continue;
          }
          
          const lastUpdate = new Date(lastUpdateDate);
          const now = new Date();
          const timeDiffMs = now.getTime() - lastUpdate.getTime();
          const daysPassed = timeDiffMs / (1000 * 60 * 60 * 24);

          if (daysPassed < 1) {
            continue;
          }

          const stakedAmount = parseFloat(subscription.stakedAmount);
          const apy = parseFloat(subscription.currentApy) / 100;
          const dailyRate = apy / 365;
          const daysToCompound = Math.floor(daysPassed);

          let accruedRewards = 0;
          for (let i = 0; i < daysToCompound; i++) {
            accruedRewards += stakedAmount * dailyRate;
          }

          if (accruedRewards > 0) {
            await storage.createSpectrumEarning({
              subscriptionId: subscription.id,
              userId: subscription.userId,
              amount: accruedRewards.toFixed(18),
              apy: subscription.currentApy,
              periodStart: lastUpdate,
              periodEnd: now,
            });

            const newTotalEarned = parseFloat(subscription.totalEarned || "0") + accruedRewards;
            await storage.updateSpectrumSubscription(subscription.id, {
              totalEarned: newTotalEarned.toFixed(18),
              lastEarningsUpdate: now,
            });

            console.log(`✓ Compounded ${accruedRewards.toFixed(2)} for subscription ${subscription.id}`);
          }
        } catch (error) {
          console.error(`Error calculating interest for subscription ${subscription.id}:`, error);
        }
      }

      console.log("Daily compound interest calculation complete!");
    } catch (error) {
      console.error("Error in daily compound calculation:", error);
    }
  }

  startDailyCompoundingSchedule(): void {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    this.calculateDailyCompoundInterest();

    setInterval(() => {
      this.calculateDailyCompoundInterest();
    }, TWENTY_FOUR_HOURS);

    console.log("Daily compounding schedule started!");
  }
}

export const spectrumService = new SpectrumService();
