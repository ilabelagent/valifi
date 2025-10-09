import { storage } from "./storage";
import type { InsertPrayer, InsertScripture, InsertPrayerTradeCorrelation, Prayer } from "@shared/schema";

const TRADING_SCRIPTURES = [
  // Trading & Business Wisdom (15 verses)
  {
    verse: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    reference: "Proverbs 3:5-6",
    category: "trading" as const,
  },
  {
    verse: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
    reference: "Proverbs 21:5",
    category: "trading" as const,
  },
  {
    verse: "Commit to the LORD whatever you do, and he will establish your plans.",
    reference: "Proverbs 16:3",
    category: "trading" as const,
  },
  {
    verse: "Do not wear yourself out to get rich; do not trust your own cleverness.",
    reference: "Proverbs 23:4",
    category: "trading" as const,
  },
  {
    verse: "The borrower is slave to the lender.",
    reference: "Proverbs 22:7",
    category: "trading" as const,
  },
  {
    verse: "The LORD abhors dishonest scales, but accurate weights find favor with him.",
    reference: "Proverbs 11:1",
    category: "trading" as const,
  },
  {
    verse: "Good planning and hard work lead to prosperity, but hasty shortcuts lead to poverty.",
    reference: "Proverbs 21:5",
    category: "trading" as const,
  },
  {
    verse: "Wealth from get-rich-quick schemes quickly disappears; wealth from hard work grows over time.",
    reference: "Proverbs 13:11",
    category: "trading" as const,
  },
  {
    verse: "The wise store up choice food and olive oil, but fools gulp theirs down.",
    reference: "Proverbs 21:20",
    category: "trading" as const,
  },
  {
    verse: "One who is faithful in a very little is also faithful in much.",
    reference: "Luke 16:10",
    category: "trading" as const,
  },
  {
    verse: "Do you see someone skilled in their work? They will serve before kings.",
    reference: "Proverbs 22:29",
    category: "trading" as const,
  },
  {
    verse: "Unless the LORD builds the house, the builders labor in vain.",
    reference: "Psalm 127:1",
    category: "trading" as const,
  },
  {
    verse: "Better a little with the fear of the LORD than great wealth with turmoil.",
    reference: "Proverbs 15:16",
    category: "trading" as const,
  },
  {
    verse: "Do not be overawed when others grow rich, when the splendor of their houses increases.",
    reference: "Psalm 49:16",
    category: "trading" as const,
  },
  {
    verse: "Keep your lives free from the love of money and be content with what you have.",
    reference: "Hebrews 13:5",
    category: "trading" as const,
  },

  // Wisdom & Discernment (20 verses)
  {
    verse: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
    reference: "Matthew 6:33",
    category: "wisdom" as const,
  },
  {
    verse: "The one who gets wisdom loves life; the one who cherishes understanding will soon prosper.",
    reference: "Proverbs 19:8",
    category: "wisdom" as const,
  },
  {
    verse: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault.",
    reference: "James 1:5",
    category: "wisdom" as const,
  },
  {
    verse: "For wisdom is more precious than rubies, and nothing you desire can compare with her.",
    reference: "Proverbs 8:11",
    category: "wisdom" as const,
  },
  {
    verse: "Choose my instruction instead of silver, knowledge rather than choice gold.",
    reference: "Proverbs 8:10",
    category: "wisdom" as const,
  },
  {
    verse: "How much better to get wisdom than gold, to get insight rather than silver!",
    reference: "Proverbs 16:16",
    category: "wisdom" as const,
  },
  {
    verse: "The fear of the LORD is the beginning of wisdom.",
    reference: "Proverbs 9:10",
    category: "wisdom" as const,
  },
  {
    verse: "Who is wise? Let them realize these things. Who is discerning? Let them understand.",
    reference: "Hosea 14:9",
    category: "wisdom" as const,
  },
  {
    verse: "Get wisdom, get understanding; do not forget my words or turn away from them.",
    reference: "Proverbs 4:5",
    category: "wisdom" as const,
  },
  {
    verse: "Wisdom is supreme; therefore get wisdom. Though it cost all you have, get understanding.",
    reference: "Proverbs 4:7",
    category: "wisdom" as const,
  },
  {
    verse: "The way of fools seems right to them, but the wise listen to advice.",
    reference: "Proverbs 12:15",
    category: "wisdom" as const,
  },
  {
    verse: "Plans fail for lack of counsel, but with many advisers they succeed.",
    reference: "Proverbs 15:22",
    category: "wisdom" as const,
  },
  {
    verse: "Let the wise listen and add to their learning, and let the discerning get guidance.",
    reference: "Proverbs 1:5",
    category: "wisdom" as const,
  },
  {
    verse: "For the LORD gives wisdom; from his mouth come knowledge and understanding.",
    reference: "Proverbs 2:6",
    category: "wisdom" as const,
  },
  {
    verse: "Blessed are those who find wisdom, those who gain understanding.",
    reference: "Proverbs 3:13",
    category: "wisdom" as const,
  },
  {
    verse: "The teaching of the wise is a fountain of life, turning a person from the snares of death.",
    reference: "Proverbs 13:14",
    category: "wisdom" as const,
  },
  {
    verse: "A wise person thinks a lot about death, while a fool thinks only about having a good time.",
    reference: "Ecclesiastes 7:4",
    category: "wisdom" as const,
  },
  {
    verse: "Where there is strife, there is pride, but wisdom is found in those who take advice.",
    reference: "Proverbs 13:10",
    category: "wisdom" as const,
  },
  {
    verse: "The wisdom of the prudent is to give thought to their ways.",
    reference: "Proverbs 14:8",
    category: "wisdom" as const,
  },
  {
    verse: "A fool gives full vent to his spirit, but a wise man quietly holds it back.",
    reference: "Proverbs 29:11",
    category: "wisdom" as const,
  },

  // Prosperity & Provision (15 verses)
  {
    verse: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
    reference: "Jeremiah 29:11",
    category: "prosperity" as const,
  },
  {
    verse: "Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this and see if I will not throw open the floodgates of heaven.",
    reference: "Malachi 3:10",
    category: "prosperity" as const,
  },
  {
    verse: "Honor the LORD with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing.",
    reference: "Proverbs 3:9-10",
    category: "prosperity" as const,
  },
  {
    verse: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.",
    reference: "Philippians 4:19",
    category: "prosperity" as const,
  },
  {
    verse: "The blessing of the LORD brings wealth, without painful toil for it.",
    reference: "Proverbs 10:22",
    category: "prosperity" as const,
  },
  {
    verse: "Give, and it will be given to you. A good measure, pressed down, shaken together and running over.",
    reference: "Luke 6:38",
    category: "prosperity" as const,
  },
  {
    verse: "Whoever sows sparingly will also reap sparingly, and whoever sows generously will also reap generously.",
    reference: "2 Corinthians 9:6",
    category: "prosperity" as const,
  },
  {
    verse: "The generous will prosper; those who refresh others will themselves be refreshed.",
    reference: "Proverbs 11:25",
    category: "prosperity" as const,
  },
  {
    verse: "A generous person will prosper; whoever refreshes others will be refreshed.",
    reference: "Proverbs 11:25",
    category: "prosperity" as const,
  },
  {
    verse: "A good person leaves an inheritance for their children's children.",
    reference: "Proverbs 13:22",
    category: "prosperity" as const,
  },
  {
    verse: "Do not be afraid, little flock, for your Father has been pleased to give you the kingdom.",
    reference: "Luke 12:32",
    category: "prosperity" as const,
  },
  {
    verse: "Humility is the fear of the LORD; its wages are riches and honor and life.",
    reference: "Proverbs 22:4",
    category: "prosperity" as const,
  },
  {
    verse: "The house of the righteous contains great treasure.",
    reference: "Proverbs 15:6",
    category: "prosperity" as const,
  },
  {
    verse: "May the LORD bless you and keep you; may the LORD make his face shine on you.",
    reference: "Numbers 6:24-25",
    category: "prosperity" as const,
  },
  {
    verse: "I will bless you and make your name great, and you will be a blessing.",
    reference: "Genesis 12:2",
    category: "prosperity" as const,
  },

  // Faith & Trust (15 verses)
  {
    verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    reference: "Philippians 4:6",
    category: "faith" as const,
  },
  {
    verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    reference: "Romans 8:28",
    category: "faith" as const,
  },
  {
    verse: "Blessed is the one who perseveres under trial because, having stood the test, that person will receive the crown of life.",
    reference: "James 1:12",
    category: "faith" as const,
  },
  {
    verse: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7",
    category: "faith" as const,
  },
  {
    verse: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    reference: "Hebrews 11:1",
    category: "faith" as const,
  },
  {
    verse: "I can do all this through him who gives me strength.",
    reference: "Philippians 4:13",
    category: "faith" as const,
  },
  {
    verse: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you.",
    reference: "Joshua 1:9",
    category: "faith" as const,
  },
  {
    verse: "The righteous person may have many troubles, but the LORD delivers him from them all.",
    reference: "Psalm 34:19",
    category: "faith" as const,
  },
  {
    verse: "If we are faithless, he remains faithful, for he cannot disown himself.",
    reference: "2 Timothy 2:13",
    category: "faith" as const,
  },
  {
    verse: "Faith is taking the first step even when you don't see the whole staircase.",
    reference: "Hebrews 11:8",
    category: "faith" as const,
  },
  {
    verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    reference: "Galatians 6:9",
    category: "faith" as const,
  },
  {
    verse: "For we live by faith, not by sight.",
    reference: "2 Corinthians 5:7",
    category: "faith" as const,
  },
  {
    verse: "Trust in the LORD forever, for the LORD, the LORD himself, is the Rock eternal.",
    reference: "Isaiah 26:4",
    category: "faith" as const,
  },
  {
    verse: "The LORD is good, a refuge in times of trouble. He cares for those who trust in him.",
    reference: "Nahum 1:7",
    category: "faith" as const,
  },
  {
    verse: "Those who hope in the LORD will renew their strength. They will soar on wings like eagles.",
    reference: "Isaiah 40:31",
    category: "faith" as const,
  },

  // Protection & Security (12 verses)
  {
    verse: "The LORD is my shepherd, I lack nothing.",
    reference: "Psalm 23:1",
    category: "protection" as const,
  },
  {
    verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.",
    reference: "Joshua 1:9",
    category: "protection" as const,
  },
  {
    verse: "The name of the LORD is a fortified tower; the righteous run to it and are safe.",
    reference: "Proverbs 18:10",
    category: "protection" as const,
  },
  {
    verse: "He will cover you with his feathers, and under his wings you will find refuge; his faithfulness will be your shield.",
    reference: "Psalm 91:4",
    category: "protection" as const,
  },
  {
    verse: "The LORD is my light and my salvation—whom shall I fear? The LORD is the stronghold of my life.",
    reference: "Psalm 27:1",
    category: "protection" as const,
  },
  {
    verse: "God is our refuge and strength, an ever-present help in trouble.",
    reference: "Psalm 46:1",
    category: "protection" as const,
  },
  {
    verse: "The angel of the LORD encamps around those who fear him, and he delivers them.",
    reference: "Psalm 34:7",
    category: "protection" as const,
  },
  {
    verse: "Even though I walk through the darkest valley, I will fear no evil, for you are with me.",
    reference: "Psalm 23:4",
    category: "protection" as const,
  },
  {
    verse: "No weapon forged against you will prevail.",
    reference: "Isaiah 54:17",
    category: "protection" as const,
  },
  {
    verse: "The LORD will keep you from all harm—he will watch over your life.",
    reference: "Psalm 121:7",
    category: "protection" as const,
  },
  {
    verse: "Do not be afraid, for I am with you; do not be dismayed, for I am your God.",
    reference: "Isaiah 41:10",
    category: "protection" as const,
  },
  {
    verse: "But the Lord is faithful, and he will strengthen you and protect you from the evil one.",
    reference: "2 Thessalonians 3:3",
    category: "protection" as const,
  },

  // Patience & Self-Control (10 verses)
  {
    verse: "A patient person shows great understanding, but a quick-tempered one promotes foolishness.",
    reference: "Proverbs 14:29",
    category: "patience" as const,
  },
  {
    verse: "Be patient, then, brothers and sisters, until the Lord's coming. See how the farmer waits.",
    reference: "James 5:7",
    category: "patience" as const,
  },
  {
    verse: "Better a patient person than a warrior, one with self-control than one who takes a city.",
    reference: "Proverbs 16:32",
    category: "patience" as const,
  },
  {
    verse: "A hot-tempered person stirs up conflict, but the one who is patient calms a quarrel.",
    reference: "Proverbs 15:18",
    category: "patience" as const,
  },
  {
    verse: "The end of a matter is better than its beginning, and patience is better than pride.",
    reference: "Ecclesiastes 7:8",
    category: "patience" as const,
  },
  {
    verse: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
    reference: "1 Corinthians 13:4",
    category: "patience" as const,
  },
  {
    verse: "Wait for the LORD; be strong and take heart and wait for the LORD.",
    reference: "Psalm 27:14",
    category: "patience" as const,
  },
  {
    verse: "Be still before the LORD and wait patiently for him.",
    reference: "Psalm 37:7",
    category: "patience" as const,
  },
  {
    verse: "The LORD is good to those whose hope is in him, to the one who seeks him.",
    reference: "Lamentations 3:25",
    category: "patience" as const,
  },
  {
    verse: "But those who hope in the LORD will renew their strength.",
    reference: "Isaiah 40:31",
    category: "patience" as const,
  },

  // Discipline & Perseverance (10 verses)
  {
    verse: "No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness.",
    reference: "Hebrews 12:11",
    category: "discipline" as const,
  },
  {
    verse: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.",
    reference: "2 Timothy 1:7",
    category: "discipline" as const,
  },
  {
    verse: "Everyone who competes in the games goes into strict training.",
    reference: "1 Corinthians 9:25",
    category: "discipline" as const,
  },
  {
    verse: "Discipline your children, and they will give you peace; they will bring you the delights you desire.",
    reference: "Proverbs 29:17",
    category: "discipline" as const,
  },
  {
    verse: "Whoever heeds discipline shows the way to life, but whoever ignores correction leads others astray.",
    reference: "Proverbs 10:17",
    category: "discipline" as const,
  },
  {
    verse: "I discipline my body like an athlete, training it to do what it should.",
    reference: "1 Corinthians 9:27",
    category: "discipline" as const,
  },
  {
    verse: "Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders.",
    reference: "Hebrews 12:1",
    category: "discipline" as const,
  },
  {
    verse: "A person without self-control is like a city with broken-down walls.",
    reference: "Proverbs 25:28",
    category: "discipline" as const,
  },
  {
    verse: "Like a city whose walls are broken through is a person who lacks self-control.",
    reference: "Proverbs 25:28",
    category: "discipline" as const,
  },
  {
    verse: "Everyone should be quick to listen, slow to speak and slow to become angry.",
    reference: "James 1:19",
    category: "discipline" as const,
  },

  // General Encouragement (8 verses)
  {
    verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16",
    category: "general" as const,
  },
  {
    verse: "The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you.",
    reference: "Numbers 6:24-25",
    category: "general" as const,
  },
  {
    verse: "This is the day the LORD has made; let us rejoice and be glad in it.",
    reference: "Psalm 118:24",
    category: "general" as const,
  },
  {
    verse: "Rejoice always, pray continually, give thanks in all circumstances.",
    reference: "1 Thessalonians 5:16-18",
    category: "general" as const,
  },
  {
    verse: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28",
    category: "general" as const,
  },
  {
    verse: "The joy of the LORD is your strength.",
    reference: "Nehemiah 8:10",
    category: "general" as const,
  },
  {
    verse: "In all your ways acknowledge him, and he will make your paths straight.",
    reference: "Proverbs 3:6",
    category: "general" as const,
  },
  {
    verse: "Delight yourself in the LORD, and he will give you the desires of your heart.",
    reference: "Psalm 37:4",
    category: "general" as const,
  },
];

export class PrayerService {
  async seedScriptures() {
    try {
      const existingCount = await storage.getScripturesCount();
      if (existingCount > 0) {
        console.log("Scriptures already seeded");
        return;
      }

      for (const scripture of TRADING_SCRIPTURES) {
        await storage.createScripture(scripture);
      }
      console.log(`Scriptures seeded successfully: ${TRADING_SCRIPTURES.length} verses`);
    } catch (error) {
      console.error("Error seeding scriptures:", error);
    }
  }

  async getRandomScripture(category?: string) {
    const scriptures = await storage.getScripturesByCategory(category);
    if (scriptures.length === 0) {
      return TRADING_SCRIPTURES[Math.floor(Math.random() * TRADING_SCRIPTURES.length)];
    }
    return scriptures[Math.floor(Math.random() * scriptures.length)];
  }

  async getDailyScripture() {
    const today = new Date().toISOString().split("T")[0];
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    
    const scriptures = await storage.getAllScriptures();
    if (scriptures.length === 0) {
      return TRADING_SCRIPTURES[dayOfYear % TRADING_SCRIPTURES.length];
    }
    
    return scriptures[dayOfYear % scriptures.length];
  }

  async logPrayer(userId: string, prayerText: string, category: string) {
    const prayer: InsertPrayer = {
      userId,
      prayerText,
      category: category as any,
    };
    return await storage.createPrayer(prayer);
  }

  async getUserPrayers(userId: string, limit?: number) {
    return await storage.getUserPrayers(userId, limit);
  }

  async correlatePrayerWithTrade(
    prayerId: string,
    tradeId?: string,
    botExecutionId?: string,
    outcome?: string,
    profitLoss?: string
  ) {
    const correlation: InsertPrayerTradeCorrelation = {
      prayerId,
      tradeId,
      botExecutionId,
      outcome,
      profitLoss,
    };
    return await storage.createPrayerTradeCorrelation(correlation);
  }

  async getPrayerInsights(userId: string) {
    const prayers = await storage.getUserPrayers(userId);
    const correlations = await storage.getUserPrayerCorrelations(userId);

    const totalPrayers = prayers.length;
    const prayersWithTrades = correlations.length;
    
    const profitableCount = correlations.filter(c => c.outcome === "profitable").length;
    const lossCount = correlations.filter(c => c.outcome === "loss").length;
    const pendingCount = correlations.filter(c => c.outcome === "pending").length;

    const totalProfitLoss = correlations.reduce((sum, c) => {
      if (c.profitLoss) {
        return sum + parseFloat(c.profitLoss);
      }
      return sum;
    }, 0);

    const categoryStats = prayers.reduce((stats: Record<string, number>, prayer) => {
      stats[prayer.category] = (stats[prayer.category] || 0) + 1;
      return stats;
    }, {});

    return {
      totalPrayers,
      prayersWithTrades,
      profitableCount,
      lossCount,
      pendingCount,
      totalProfitLoss: totalProfitLoss.toFixed(2),
      successRate: prayersWithTrades > 0 ? ((profitableCount / prayersWithTrades) * 100).toFixed(2) : "0.00",
      categoryStats,
      recentPrayers: prayers.slice(0, 10),
      recentCorrelations: correlations.slice(0, 10),
    };
  }

  async getPrayerHistory(userId: string) {
    const prayers = await storage.getUserPrayers(userId);
    const correlations = await storage.getUserPrayerCorrelations(userId);

    const prayerMap = new Map(prayers.map(p => [p.id, p]));
    
    return prayers.map(prayer => {
      const relatedCorrelations = correlations.filter(c => c.prayerId === prayer.id);
      return {
        ...prayer,
        trades: relatedCorrelations,
      };
    });
  }
}

export const prayerService = new PrayerService();
