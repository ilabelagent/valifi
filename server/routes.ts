// Valifi Kingdom Platform API Routes - blueprint: javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertWalletSchema,
  insertTransactionSchema,
  insertNftSchema,
  insertTokenSchema,
  insertSongSchema,
  insertAgentSchema,
  insertSecurityEventSchema,
  insertPaymentSchema,
  insertKycRecordSchema,
  insertQuantumJobSchema,
  insertCryptoPaymentSchema,
  insertTradingBotSchema,
  insertBotExecutionSchema,
  insertArmorWalletSchema,
  insertMevEventSchema,
  insertExchangeOrderSchema,
  insertLiquidityPoolSchema,
  insertMixingRequestSchema,
  insertForumCategorySchema,
  insertForumThreadSchema,
  insertForumReplySchema,
  insertChatSessionSchema,
  insertChatMessageSchema,
  insertMetalInventorySchema,
  insertMetalTradeSchema,
  insertMetalProductSchema,
  insertMetalOwnershipSchema,
  insertBlogPostSchema,
  insertUserDashboardConfigSchema,
  insertDashboardWidgetSchema,
  insertUserWidgetPreferenceSchema,
  insertAdminUserSchema,
  insertAdminAuditLogSchema,
  insertAdminBroadcastSchema,
  insertBotMarketplaceListingSchema,
  insertBotRentalSchema,
  insertBotSubscriptionSchema,
  insertBotReviewSchema,
  insertBotLearningSessionSchema,
  insertBotTrainingDataSchema,
  insertBotSkillSchema,
  insertP2POfferSchema,
  insertP2POrderSchema,
  insertP2PPaymentMethodSchema,
  insertP2PChatMessageSchema,
  insertP2PDisputeSchema,
  insertP2PReviewSchema,
  insertWalletConnectSessionSchema,
  insertCelebrityProfileSchema,
  insertFanFollowSchema,
  insertFanStakeSchema,
  insertFanBetSchema,
  insertPredictionMarketSchema,
  insertCelebrityContentSchema,
  insertSpectrumPlanSchema,
  insertUserSpectrumSubscriptionSchema,
  insertSpectrumEarningSchema,
  insertIndividualAssetSchema,
  insertEtherealElementSchema,
  insertEtherealOwnershipSchema,
  insertJesusCartelReleaseSchema,
  insertJesusCartelEventSchema,
  insertJesusCartelStreamSchema,
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { web3Service } from "./web3Service";
import { jesusCartelService } from "./jesusCartelService";
import { agentOrchestrator } from "./agentOrchestrator";
import { websocketService } from "./websocketService";
import { encryptionService } from "./encryptionService";
import { cryptoProcessorService } from "./cryptoProcessorService";
import { tradingBotService } from "./tradingBotService";
import { armorWalletService } from "./armorWalletService";
import { marketDataService } from "./marketDataService";
import { botLearningService } from "./botLearningService";
import { brokerIntegrationService } from "./brokerIntegrationService";
import { alpacaBrokerService } from "./alpacaBrokerService";
import { botStocks, botOptions, type TradeOrder } from "./financialServicesBot";
import { prayerService } from "./prayerService";
import { insertPrayerSchema, insertScriptureSchema, insertPrayerTradeCorrelationSchema, insertCharitySchema, insertTithingConfigSchema, insertTithingHistorySchema } from "@shared/schema";
import { tithingService } from "./tithingService";
import { etherealService } from "./etherealService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Admin check middleware with role attachment
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Load and attach adminUser for role-based checks
      const adminUser = await storage.getAdminUser(userId);
      if (!adminUser) {
        return res.status(403).json({ message: "Admin profile not found" });
      }
      
      req.adminUser = adminUser;
      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization check failed" });
    }
  };

  // Super admin check middleware
  const isSuperAdmin = (req: any, res: any, next: any) => {
    if (req.adminUser?.role !== "super_admin") {
      return res.status(403).json({ message: "Super admin access required" });
    }
    next();
  };

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Wallet routes
  app.get("/api/wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallets = await storage.getWalletsByUserId(userId);
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.post("/api/wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate wallet data WITHOUT userId (server-side only)
      const validation = insertWalletSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid wallet data", 
          error: fromError(validation.error).toString() 
        });
      }

      // Merge validated data with server-side userId
      const wallet = await storage.createWallet({
        ...validation.data,
        userId,
      });
      res.json(wallet);
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(500).json({ message: "Failed to create wallet" });
    }
  });

  // Web3 Blockchain routes
  app.post("/api/web3/create-wallet", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { network = "ethereum", currency } = req.body;

      // Create blockchain wallet
      const walletData = await web3Service.createWallet(userId, network);

      // Encrypt private key with user-specific encryption
      const encryptedPrivateKey = encryptionService.encrypt(
        walletData.privateKey,
        userId
      );

      // Store in database with encrypted private key
      const wallet = await storage.createWallet({
        userId,
        address: walletData.address,
        balance: "0",
        network,
        privateKeyEncrypted: encryptedPrivateKey,
      });

      // SECURITY: Return mnemonic ONLY ONCE for user backup
      // Client must save this immediately - never stored or returned again
      res.json({
        id: wallet.id,
        address: wallet.address,
        network: wallet.network,
        balance: wallet.balance,
        mnemonic: walletData.mnemonic,
        warning: "Save this mnemonic phrase securely - it will never be shown again!",
      });
    } catch (error) {
      console.error("Error creating Web3 wallet:", error);
      res.status(500).json({ message: "Failed to create Web3 wallet" });
    }
  });

  // Import wallet from mnemonic or private key
  app.post("/api/web3/import-wallet", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mnemonic, privateKey, network = "ethereum" } = req.body;

      let walletData: { address: string; privateKey: string };

      if (mnemonic) {
        walletData = await web3Service.importWalletFromMnemonic(mnemonic);
      } else if (privateKey) {
        walletData = await web3Service.importWalletFromPrivateKey(privateKey);
      } else {
        return res.status(400).json({ message: "Mnemonic or private key required" });
      }

      // Check if wallet already exists
      const existingWallet = await storage.getWalletByAddress(walletData.address);
      if (existingWallet) {
        return res.status(400).json({ message: "Wallet already imported" });
      }

      // Encrypt private key
      const encryptedPrivateKey = encryptionService.encrypt(
        walletData.privateKey,
        userId
      );

      // Store in database
      const wallet = await storage.createWallet({
        userId,
        address: walletData.address,
        balance: "0",
        network,
        privateKeyEncrypted: encryptedPrivateKey,
      });

      res.json({
        id: wallet.id,
        address: wallet.address,
        network: wallet.network,
        balance: wallet.balance,
      });
    } catch (error: any) {
      console.error("Error importing wallet:", error);
      res.status(500).json({ message: error.message || "Failed to import wallet" });
    }
  });

  app.get("/api/web3/balance/:walletId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify wallet belongs to user
      const wallet = await storage.getWallet(req.params.walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      const balance = await web3Service.getBalance(
        wallet.address,
        wallet.network || "ethereum"
      );

      // Update balance in database
      await storage.updateWalletBalance(wallet.id, balance);

      res.json({ balance, address: wallet.address });
    } catch (error) {
      console.error("Error fetching Web3 balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  app.post("/api/web3/send-transaction", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId, to, amount } = req.body;

      // Verify wallet belongs to user
      const wallet = await storage.getWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      // Decrypt private key securely
      const privateKey = encryptionService.decrypt(
        wallet.privateKeyEncrypted || "",
        userId
      );

      // Send transaction
      const result = await web3Service.sendTransaction(
        privateKey,
        to,
        amount,
        wallet.network || "ethereum"
      );

      // Record transaction
      await storage.createTransaction({
        walletId: wallet.id,
        type: "send",
        from: wallet.address,
        to,
        value: amount,
        status: "confirmed",
        txHash: result.hash,
        network: wallet.network || "ethereum",
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      res.status(500).json({ message: error.message || "Transaction failed" });
    }
  });

  app.post("/api/web3/deploy-erc20", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId, name, symbol, initialSupply, network = "polygon" } = req.body;

      // Verify wallet belongs to user
      const wallet = await storage.getWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      // Decrypt private key securely
      const privateKey = encryptionService.decrypt(
        wallet.privateKeyEncrypted || "",
        userId
      );

      // Deploy ERC-20 token
      const deployment = await web3Service.deployERC20(
        name,
        symbol,
        initialSupply,
        privateKey,
        network
      );

      // Store token in database
      const token = await storage.createToken({
        walletId: wallet.id,
        contractAddress: deployment.address,
        name,
        symbol,
        totalSupply: initialSupply,
        network,
      });

      res.json({ ...token, txHash: deployment.txHash });
    } catch (error: any) {
      console.error("Error deploying ERC-20:", error);
      res.status(500).json({ message: error.message || "Deployment failed" });
    }
  });

  app.post("/api/web3/deploy-erc721", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId, name, symbol, network = "polygon" } = req.body;

      // Verify wallet belongs to user
      const wallet = await storage.getWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      // Decrypt private key securely
      const privateKey = encryptionService.decrypt(
        wallet.privateKeyEncrypted || "",
        userId
      );

      // Deploy ERC-721 NFT contract
      const deployment = await web3Service.deployERC721(
        name,
        symbol,
        privateKey,
        network
      );

      res.json(deployment);
    } catch (error: any) {
      console.error("Error deploying ERC-721:", error);
      res.status(500).json({ message: error.message || "Deployment failed" });
    }
  });

  app.post("/api/web3/mint-nft", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId, contractAddress, tokenId, tokenURI, network = "polygon" } = req.body;

      // Verify wallet belongs to user
      const wallet = await storage.getWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      // Decrypt private key securely
      const privateKey = encryptionService.decrypt(
        wallet.privateKeyEncrypted || "",
        userId
      );

      // Mint NFT
      const result = await web3Service.mintNFT(
        contractAddress,
        wallet.address,
        tokenId,
        tokenURI,
        privateKey,
        network
      );

      // Store NFT in database
      const nft = await storage.createNft({
        walletId: wallet.id,
        contractAddress,
        tokenId: tokenId.toString(),
        name: `NFT #${tokenId}`,
        description: "Minted NFT",
        imageUrl: tokenURI,
        network,
      });

      res.json({ ...nft, txHash: result.txHash });
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      res.status(500).json({ message: error.message || "Minting failed" });
    }
  });

  // Transaction routes
  app.get("/api/transactions/:walletId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify wallet belongs to user
      const wallet = await storage.getWallet(req.params.walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      const transactions = await storage.getTransactionsByWalletId(req.params.walletId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify wallet belongs to user
      const wallet = await storage.getWallet(req.body.walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      const validation = insertTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid transaction data", 
          error: fromError(validation.error).toString() 
        });
      }

      const transaction = await storage.createTransaction(validation.data);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // NFT routes
  app.get("/api/nfts/:walletId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify wallet belongs to user
      const wallet = await storage.getWallet(req.params.walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      const nfts = await storage.getNftsByWalletId(req.params.walletId);
      res.json(nfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      res.status(500).json({ message: "Failed to fetch NFTs" });
    }
  });

  app.post("/api/nfts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify wallet belongs to user
      const wallet = await storage.getWallet(req.body.walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      const validation = insertNftSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid NFT data", 
          error: fromError(validation.error).toString() 
        });
      }

      const nft = await storage.createNft(validation.data);
      res.json(nft);
    } catch (error) {
      console.error("Error creating NFT:", error);
      res.status(500).json({ message: "Failed to create NFT" });
    }
  });

  // Token routes
  app.get("/api/tokens/:walletId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify wallet belongs to user
      const wallet = await storage.getWallet(req.params.walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      const tokens = await storage.getTokensByWalletId(req.params.walletId);
      res.json(tokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).json({ message: "Failed to fetch tokens" });
    }
  });

  app.post("/api/tokens", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify wallet belongs to user
      const wallet = await storage.getWallet(req.body.walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      const validation = insertTokenSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid token data", 
          error: fromError(validation.error).toString() 
        });
      }

      const token = await storage.createToken(validation.data);
      res.json(token);
    } catch (error) {
      console.error("Error creating token:", error);
      res.status(500).json({ message: "Failed to create token" });
    }
  });

  // Song routes (Jesus Cartel publishing)
  app.get("/api/songs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const includeDetails = req.query.includeDetails === 'true';
      
      if (includeDetails) {
        const songs = await storage.getSongsWithDetailsByUserId(userId);
        res.json(songs);
      } else {
        const songs = await storage.getSongsByUserId(userId);
        res.json(songs);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.post("/api/songs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate song data WITHOUT userId (server-side only)
      const validation = insertSongSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid song data", 
          error: fromError(validation.error).toString() 
        });
      }

      // Merge validated data with server-side userId
      const song = await storage.createSong({
        ...validation.data,
        userId,
      });
      res.json(song);
    } catch (error) {
      console.error("Error creating song:", error);
      res.status(500).json({ message: "Failed to create song" });
    }
  });

  app.post("/api/songs/:id/publish", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify song belongs to user
      const song = await storage.getSong(req.params.id);
      if (!song || song.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this song" });
      }

      // Validate publication data
      const publishSchema = z.object({
        walletId: z.string(),
        mintNFT: z.boolean().optional().default(true),
        createToken: z.boolean().optional().default(true),
        network: z.string().optional().default("polygon"),
        tokenSupply: z.string().optional().default("1000000"),
      });
      
      const validation = publishSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid publication data", 
          error: fromError(validation.error).toString() 
        });
      }

      // Verify wallet belongs to user
      const wallet = await storage.getWallet(validation.data.walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to this wallet" });
      }

      // Execute Jesus Cartel publishing pipeline
      const result = await jesusCartelService.publishSong(
        req.params.id,
        validation.data.walletId,
        {
          mintNFT: validation.data.mintNFT,
          createToken: validation.data.createToken,
          network: validation.data.network,
          tokenSupply: validation.data.tokenSupply,
        }
      );

      res.json(result);
    } catch (error: any) {
      console.error("Error publishing song:", error);
      res.status(500).json({ 
        message: error.message || "Failed to publish song" 
      });
    }
  });

  // Jesus Cartel Music Ministry Routes
  // Public routes - no auth required for viewing
  app.get("/api/jesus-cartel/releases", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const releases = await jesusCartelService.getLatestReleases(limit);
      res.json(releases);
    } catch (error) {
      console.error("Error fetching releases:", error);
      res.status(500).json({ message: "Failed to fetch releases" });
    }
  });

  app.get("/api/jesus-cartel/releases/featured", async (req, res) => {
    try {
      const releases = await jesusCartelService.getFeaturedReleases();
      res.json(releases);
    } catch (error) {
      console.error("Error fetching featured releases:", error);
      res.status(500).json({ message: "Failed to fetch featured releases" });
    }
  });

  app.get("/api/jesus-cartel/releases/:id", async (req, res) => {
    try {
      const release = await jesusCartelService.getRelease(req.params.id);
      if (!release) {
        return res.status(404).json({ message: "Release not found" });
      }
      res.json(release);
    } catch (error) {
      console.error("Error fetching release:", error);
      res.status(500).json({ message: "Failed to fetch release" });
    }
  });

  app.get("/api/jesus-cartel/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await jesusCartelService.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/jesus-cartel/events/featured", async (req, res) => {
    try {
      const events = await jesusCartelService.getFeaturedEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching featured events:", error);
      res.status(500).json({ message: "Failed to fetch featured events" });
    }
  });

  app.get("/api/jesus-cartel/events/:id", async (req, res) => {
    try {
      const event = await jesusCartelService.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Stream tracking
  app.post("/api/jesus-cartel/streams", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub; // Optional user tracking
      
      const validation = insertJesusCartelStreamSchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid stream data", 
          error: fromError(validation.error).toString() 
        });
      }

      const stream = await jesusCartelService.trackStreams(
        validation.data.releaseId,
        userId,
        validation.data.duration,
        validation.data.completionRate ? parseFloat(validation.data.completionRate) : undefined
      );
      
      res.json(stream);
    } catch (error) {
      console.error("Error tracking stream:", error);
      res.status(500).json({ message: "Failed to track stream" });
    }
  });

  // Like a release
  app.post("/api/jesus-cartel/releases/:id/like", async (req, res) => {
    try {
      await jesusCartelService.likeRelease(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking release:", error);
      res.status(500).json({ message: "Failed to like release" });
    }
  });

  // Admin routes for managing releases and events
  app.post("/api/admin/jesus-cartel/releases", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertJesusCartelReleaseSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid release data", 
          error: fromError(validation.error).toString() 
        });
      }

      const release = await storage.createRelease(validation.data);
      res.json(release);
    } catch (error) {
      console.error("Error creating release:", error);
      res.status(500).json({ message: "Failed to create release" });
    }
  });

  app.put("/api/admin/jesus-cartel/releases/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updates = req.body;
      await storage.updateRelease(req.params.id, updates);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating release:", error);
      res.status(500).json({ message: "Failed to update release" });
    }
  });

  app.delete("/api/admin/jesus-cartel/releases/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteRelease(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting release:", error);
      res.status(500).json({ message: "Failed to delete release" });
    }
  });

  app.post("/api/admin/jesus-cartel/events", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertJesusCartelEventSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          error: fromError(validation.error).toString() 
        });
      }

      const event = await storage.createEvent(validation.data);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/admin/jesus-cartel/events/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updates = req.body;
      await storage.updateEvent(req.params.id, updates);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/admin/jesus-cartel/events/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Agent routes
  app.get("/api/agents", isAuthenticated, async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", isAuthenticated, async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can create agents
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validation = insertAgentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid agent data", 
          error: fromError(validation.error).toString() 
        });
      }

      const agent = await storage.createAgent(validation.data);
      res.json(agent);
    } catch (error) {
      console.error("Error creating agent:", error);
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  app.post("/api/agents/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can update agent status
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Validate agent status update data
      const statusSchema = z.object({
        status: z.enum(["active", "idle", "error", "maintenance"]),
        currentTask: z.string().optional(),
      });
      
      const validation = statusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid agent status data", 
          error: fromError(validation.error).toString() 
        });
      }

      await storage.updateAgentStatus(
        req.params.id, 
        validation.data.status, 
        validation.data.currentTask
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating agent status:", error);
      res.status(500).json({ message: "Failed to update agent status" });
    }
  });

  app.get("/api/agents/:id/logs", isAuthenticated, async (req, res) => {
    try {
      const logs = await storage.getAgentLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching agent logs:", error);
      res.status(500).json({ message: "Failed to fetch agent logs" });
    }
  });

  // Agent orchestration endpoint
  app.post("/api/agents/execute", isAuthenticated, async (req: any, res) => {
    try {
      const { task, agentType } = req.body;

      if (!task) {
        return res.status(400).json({ message: "Task is required" });
      }

      // Execute task through agent orchestrator
      const result = await agentOrchestrator.execute(task, agentType);

      res.json(result);
    } catch (error: any) {
      console.error("Error executing agent task:", error);
      res.status(500).json({ message: error.message || "Agent execution failed" });
    }
  });

  // Community Exchange Bot Routes
  const { botCommunityExchange, botMultichain } = await import("./communityBot");

  app.get("/api/community/top-traders", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topTraders = await botCommunityExchange.getTopTraders(limit);
      res.json(topTraders);
    } catch (error) {
      console.error("Error getting top traders:", error);
      res.status(500).json({ message: "Failed to fetch top traders" });
    }
  });

  app.post("/api/community/copy-trade", isAuthenticated, async (req: any, res) => {
    try {
      const { copyFromBotId, copyToBotId, percentage } = req.body;

      if (!copyFromBotId || !copyToBotId) {
        return res.status(400).json({ message: "Both source and target bot IDs required" });
      }

      const userId = req.user.claims.sub;
      const targetBot = await storage.getBot(copyToBotId);
      
      if (!targetBot || targetBot.userId !== userId) {
        return res.status(403).json({ message: "Access denied to target bot" });
      }

      const result = await botCommunityExchange.copyTrade(
        copyFromBotId,
        copyToBotId,
        percentage || 100
      );
      res.json(result);
    } catch (error) {
      console.error("Error copying trade:", error);
      res.status(500).json({ message: "Failed to copy trade" });
    }
  });

  app.get("/api/community/signals/:tradingPair", isAuthenticated, async (req, res) => {
    try {
      const { tradingPair } = req.params;
      const signals = await botCommunityExchange.getCommunitySignals(tradingPair);
      res.json(signals);
    } catch (error) {
      console.error("Error getting community signals:", error);
      res.status(500).json({ message: "Failed to fetch community signals" });
    }
  });

  app.get("/api/community/leaderboard", isAuthenticated, async (req, res) => {
    try {
      const period = (req.query.period as "daily" | "weekly" | "monthly") || "weekly";
      const leaderboard = await botCommunityExchange.getCompetitionLeaderboard(period);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/community/strategies", isAuthenticated, async (req, res) => {
    try {
      const minRating = parseFloat(req.query.minRating as string) || 4.0;
      const strategies = await botCommunityExchange.getSharedStrategies(minRating);
      res.json(strategies);
    } catch (error) {
      console.error("Error getting shared strategies:", error);
      res.status(500).json({ message: "Failed to fetch shared strategies" });
    }
  });

  // Enhanced P2P Matching
  app.post("/api/community/enhanced-matching", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { cryptocurrency, amount, type, algorithm } = req.body;

      if (!cryptocurrency || !amount || !type) {
        return res.status(400).json({ 
          message: "cryptocurrency, amount, and type are required" 
        });
      }

      const result = await botCommunityExchange.enhancedP2PMatching({
        userId,
        cryptocurrency,
        amount: parseFloat(amount),
        type,
        algorithm: algorithm || "reputation",
      });
      res.json(result);
    } catch (error) {
      console.error("Error in enhanced P2P matching:", error);
      res.status(500).json({ message: "Failed to execute enhanced matching" });
    }
  });

  // Dispute Resolution
  app.post("/api/community/resolve-dispute", isAuthenticated, async (req, res) => {
    try {
      const { disputeId, autoResolve } = req.body;

      if (!disputeId) {
        return res.status(400).json({ message: "disputeId is required" });
      }

      const result = await botCommunityExchange.resolveDispute(
        disputeId, 
        autoResolve !== false
      );
      res.json(result);
    } catch (error) {
      console.error("Error resolving dispute:", error);
      res.status(500).json({ message: "Failed to resolve dispute" });
    }
  });

  // Insurance Pool Management
  app.post("/api/community/insurance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { action, amount, claimAmount, orderId } = req.body;

      if (!action) {
        return res.status(400).json({ message: "action is required" });
      }

      const result = await botCommunityExchange.manageInsurancePool(action, {
        userId,
        amount,
        claimAmount,
        orderId,
      });
      res.json(result);
    } catch (error) {
      console.error("Error managing insurance pool:", error);
      res.status(500).json({ message: "Failed to manage insurance pool" });
    }
  });

  // Multichain Bot Routes
  app.get("/api/multichain/assets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assets = await botMultichain.trackCrossChainAssets(userId);
      res.json(assets);
    } catch (error) {
      console.error("Error tracking cross-chain assets:", error);
      res.status(500).json({ message: "Failed to track assets" });
    }
  });

  app.get("/api/multichain/gas-prices", isAuthenticated, async (req, res) => {
    try {
      const gasPrices = await botMultichain.compareGasPrices();
      res.json(gasPrices);
    } catch (error) {
      console.error("Error comparing gas prices:", error);
      res.status(500).json({ message: "Failed to fetch gas prices" });
    }
  });

  app.post("/api/multichain/select-chain", isAuthenticated, async (req, res) => {
    try {
      const { fromAddress, toAddress, amount, prioritizeSpeed } = req.body;

      if (!fromAddress || !toAddress || !amount) {
        return res.status(400).json({ 
          message: "fromAddress, toAddress, and amount are required" 
        });
      }

      const result = await botMultichain.selectOptimalChain({
        fromAddress,
        toAddress,
        amount,
        prioritizeSpeed: prioritizeSpeed || false,
      });
      res.json(result);
    } catch (error) {
      console.error("Error selecting optimal chain:", error);
      res.status(500).json({ message: "Failed to select optimal chain" });
    }
  });

  app.post("/api/multichain/optimize-bridge", isAuthenticated, async (req, res) => {
    try {
      const { fromChain, toChain, asset, amount } = req.body;

      if (!fromChain || !toChain || !asset || !amount) {
        return res.status(400).json({ 
          message: "fromChain, toChain, asset, and amount are required" 
        });
      }

      const result = await botMultichain.optimizeBridgeRoute({
        fromChain,
        toChain,
        asset,
        amount,
      });
      res.json(result);
    } catch (error) {
      console.error("Error optimizing bridge route:", error);
      res.status(500).json({ message: "Failed to optimize bridge route" });
    }
  });

  app.get("/api/multichain/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dashboard = await botMultichain.getPortfolioDashboard(userId);
      res.json(dashboard);
    } catch (error) {
      console.error("Error getting multichain dashboard:", error);
      res.status(500).json({ message: "Failed to fetch multichain dashboard" });
    }
  });

  // Auto-Rebalance Chains
  app.post("/api/multichain/auto-rebalance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetDistribution, minThreshold } = req.body;

      const result = await botMultichain.autoRebalanceChains({
        userId,
        targetDistribution,
        minThreshold,
      });
      res.json(result);
    } catch (error) {
      console.error("Error auto-rebalancing chains:", error);
      res.status(500).json({ message: "Failed to auto-rebalance chains" });
    }
  });

  // Cross-Chain Arbitrage Detection
  app.post("/api/multichain/detect-arbitrage", isAuthenticated, async (req, res) => {
    try {
      const { asset, minProfitPercentage } = req.body;

      if (!asset) {
        return res.status(400).json({ message: "asset is required" });
      }

      const result = await botMultichain.detectCrossChainArbitrage({
        asset,
        minProfitPercentage,
      });
      res.json(result);
    } catch (error) {
      console.error("Error detecting cross-chain arbitrage:", error);
      res.status(500).json({ message: "Failed to detect arbitrage opportunities" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/stats/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [agents, wallets, securityEvents] = await Promise.all([
        storage.getAllAgents(),
        storage.getWalletsByUserId(userId),
        storage.getUnresolvedSecurityEvents(),
      ]);

      const activeAgents = agents.filter(a => a.status === 'active').length;
      const hasWallets = wallets.length > 0;
      const threatLevel = securityEvents.length > 0 ? 
        securityEvents[0].threatLevel : 'none';

      res.json({
        activeAgents,
        totalAgents: agents.length,
        blockchainStatus: hasWallets ? 'live' : 'not_configured',
        securityLevel: threatLevel === 'none' || threatLevel === 'low' ? 'protected' : 'warning',
        quantumStatus: 'ready', // Will be real once IBM Quantum is integrated
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Security event routes
  app.get("/api/security/events", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getUnresolvedSecurityEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching security events:", error);
      res.status(500).json({ message: "Failed to fetch security events" });
    }
  });

  app.post("/api/security/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate security event data WITHOUT userId (server-side only)
      const validation = insertSecurityEventSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid security event data", 
          error: fromError(validation.error).toString() 
        });
      }

      // Merge validated data with server-side userId
      const event = await storage.createSecurityEvent({
        ...validation.data,
        userId,
      });
      res.json(event);
    } catch (error) {
      console.error("Error creating security event:", error);
      res.status(500).json({ message: "Failed to create security event" });
    }
  });

  app.post("/api/security/events/:id/resolve", isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can resolve security events
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.resolveSecurityEvent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error resolving security event:", error);
      res.status(500).json({ message: "Failed to resolve security event" });
    }
  });

  // Payment routes
  app.get("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getPaymentsByUserId(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate payment data WITHOUT userId (server-side only)
      const validation = insertPaymentSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid payment data", 
          error: fromError(validation.error).toString() 
        });
      }

      // Merge validated data with server-side userId
      const payment = await storage.createPayment({
        ...validation.data,
        userId,
      });
      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // KYC routes
  app.get("/api/kyc/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const record = await storage.getKycRecordByUserId(userId);
      res.json(record || { status: "pending" });
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      res.status(500).json({ message: "Failed to fetch KYC status" });
    }
  });

  app.post("/api/kyc/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate KYC data WITHOUT userId (server-side only)
      const validation = insertKycRecordSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid KYC data", 
          error: fromError(validation.error).toString() 
        });
      }

      // Merge validated data with server-side userId
      const record = await storage.createKycRecord({
        ...validation.data,
        userId,
      });
      res.json(record);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      res.status(500).json({ message: "Failed to submit KYC" });
    }
  });

  // Quantum job routes
  app.get("/api/quantum/jobs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobs = await storage.getQuantumJobsByUserId(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching quantum jobs:", error);
      res.status(500).json({ message: "Failed to fetch quantum jobs" });
    }
  });

  app.post("/api/quantum/jobs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate quantum job data WITHOUT userId (server-side only)
      const validation = insertQuantumJobSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid quantum job data", 
          error: fromError(validation.error).toString() 
        });
      }

      // Merge validated data with server-side userId
      const job = await storage.createQuantumJob({
        ...validation.data,
        userId,
      });
      res.json(job);
    } catch (error) {
      console.error("Error creating quantum job:", error);
      res.status(500).json({ message: "Failed to create quantum job" });
    }
  });

  // Crypto payment processor routes
  app.post("/api/crypto-payments/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { processor, amount, currency } = req.body;

      const invoice = await cryptoProcessorService.createPayment(
        processor,
        amount,
        currency,
        userId
      );

      const payment = await storage.createCryptoPayment({
        userId,
        processor,
        processorInvoiceId: invoice.invoiceId,
        amount: invoice.amount,
        currency: invoice.currency,
        fiatAmount: amount.toString(),
        fiatCurrency: "usd",
        status: invoice.status,
        paymentUrl: invoice.paymentUrl,
        qrCode: invoice.qrCode,
        expiresAt: invoice.expiresAt,
        metadata: {},
      });

      res.json({ payment, invoice });
    } catch (error: any) {
      console.error("Error creating crypto payment:", error);
      res.status(500).json({ message: error.message || "Failed to create crypto payment" });
    }
  });

  app.get("/api/crypto-payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getCryptoPaymentsByUserId(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching crypto payments:", error);
      res.status(500).json({ message: "Failed to fetch crypto payments" });
    }
  });

  // Public demo endpoints for terminal page
  app.get("/api/public/demo-bots", async (_req, res) => {
    try {
      const demoBots = [
        {
          id: "demo-bot-1",
          userId: "demo",
          name: "QUANTUM GRID v2.1",
          strategy: "grid",
          tradingPair: "BTC/USDT",
          exchange: "binance",
          isActive: true,
          totalProfit: "2847.50",
          totalLoss: "1230.25",
          winRate: "68.5",
          totalTrades: 142,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-2",
          userId: "demo",
          name: "CYBER SCALPER",
          strategy: "scalping",
          tradingPair: "ETH/USDT",
          exchange: "bybit",
          isActive: true,
          totalProfit: "1523.80",
          totalLoss: "892.15",
          winRate: "72.3",
          totalTrades: 287,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-3",
          userId: "demo",
          name: "MEV HUNTER",
          strategy: "mev",
          tradingPair: "SOL/USDT",
          exchange: "kucoin",
          isActive: true,
          totalProfit: "4125.30",
          totalLoss: "2341.60",
          winRate: "64.2",
          totalTrades: 98,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-4",
          userId: "demo",
          name: "ARBITRAGE MATRIX",
          strategy: "arbitrage",
          tradingPair: "BNB/USDT",
          exchange: "binance",
          isActive: false,
          totalProfit: "856.40",
          totalLoss: "1142.80",
          winRate: "45.8",
          totalTrades: 63,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-5",
          userId: "demo",
          name: "DCA ACCUMULATOR",
          strategy: "dca",
          tradingPair: "ADA/USDT",
          exchange: "bybit",
          isActive: true,
          totalProfit: "3241.90",
          totalLoss: "1875.35",
          winRate: "71.5",
          totalTrades: 195,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-6",
          userId: "demo",
          name: "MOMENTUM AI",
          strategy: "momentum_ai",
          tradingPair: "MATIC/USDT",
          exchange: "kucoin",
          isActive: false,
          totalProfit: "1847.25",
          totalLoss: "2103.50",
          winRate: "52.1",
          totalTrades: 178,
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        },
      ];
      res.json(demoBots);
    } catch (error) {
      console.error("Error fetching demo bots:", error);
      res.status(500).json({ message: "Failed to fetch demo bots" });
    }
  });

  app.get("/api/public/demo-executions", async (_req, res) => {
    try {
      const demoExecutions = [
        {
          id: "demo-exec-1",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43250.50",
          exitPrice: "43485.75",
          profit: "235.25",
          status: "completed",
          executedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-2",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2285.30",
          exitPrice: "2292.80",
          profit: "7.50",
          status: "completed",
          executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-3",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "98.45",
          exitPrice: "99.82",
          profit: "137.00",
          status: "completed",
          executedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-4",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43485.75",
          exitPrice: "43312.40",
          profit: "-173.35",
          status: "completed",
          executedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-5",
          botId: "demo-bot-5",
          strategy: "dca",
          entryPrice: "0.5640",
          exitPrice: "0.5782",
          profit: "142.00",
          status: "completed",
          executedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-6",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2292.80",
          exitPrice: "2298.45",
          profit: "5.65",
          status: "completed",
          executedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-7",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "99.82",
          exitPrice: "98.95",
          profit: "-87.00",
          status: "completed",
          executedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-8",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43312.40",
          exitPrice: "43587.90",
          profit: "275.50",
          status: "completed",
          executedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-9",
          botId: "demo-bot-5",
          strategy: "dca",
          entryPrice: "0.5782",
          exitPrice: "0.5895",
          profit: "113.00",
          status: "completed",
          executedAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-10",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2298.45",
          exitPrice: "2303.20",
          profit: "4.75",
          status: "completed",
          executedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-11",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "98.95",
          exitPrice: "100.15",
          profit: "120.00",
          status: "completed",
          executedAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-12",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43587.90",
          exitPrice: "43425.60",
          profit: "-162.30",
          status: "completed",
          executedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-13",
          botId: "demo-bot-5",
          strategy: "dca",
          entryPrice: "0.5895",
          exitPrice: "0.6012",
          profit: "117.00",
          status: "completed",
          executedAt: new Date(Date.now() - 13 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-14",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2303.20",
          exitPrice: "2287.55",
          profit: "-15.65",
          status: "completed",
          executedAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-15",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "100.15",
          exitPrice: "101.45",
          profit: "130.00",
          status: "completed",
          executedAt: new Date(Date.now() - 15 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-16",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43425.60",
          exitPrice: "43695.20",
          profit: "269.60",
          status: "completed",
          executedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-17",
          botId: "demo-bot-5",
          strategy: "dca",
          entryPrice: "0.6012",
          exitPrice: "0.5948",
          profit: "-64.00",
          status: "completed",
          executedAt: new Date(Date.now() - 17 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-18",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2287.55",
          exitPrice: "2294.10",
          profit: "6.55",
          status: "completed",
          executedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-19",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "101.45",
          exitPrice: "100.78",
          profit: "-67.00",
          status: "completed",
          executedAt: new Date(Date.now() - 19 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-20",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43695.20",
          exitPrice: "43892.50",
          profit: "197.30",
          status: "completed",
          executedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        },
      ];
      res.json(demoExecutions);
    } catch (error) {
      console.error("Error fetching demo executions:", error);
      res.status(500).json({ message: "Failed to fetch demo executions" });
    }
  });

  // Trading bot routes
  app.post("/api/trading-bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertTradingBotSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid bot data", error: fromError(validation.error).toString() });
      }

      const bot = await storage.createBot({ ...validation.data, userId });
      res.json(bot);
    } catch (error) {
      console.error("Error creating trading bot:", error);
      res.status(500).json({ message: "Failed to create trading bot" });
    }
  });

  app.get("/api/trading-bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bots = await storage.getUserBots(userId);
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.post("/api/trading-bots/:botId/execute", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { botId } = req.params;

      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const marketData = await tradingBotService.getMarketData(bot.exchange, bot.tradingPair);
      const execution = await tradingBotService.executeBot(bot, marketData);
      res.json(execution);
    } catch (error: any) {
      console.error("Error executing bot:", error);
      res.status(500).json({ message: error.message || "Bot execution failed" });
    }
  });

  app.get("/api/trading-bots/:botId/executions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { botId } = req.params;

      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const executions = await storage.getBotExecutions(botId);
      res.json(executions);
    } catch (error) {
      console.error("Error fetching bot executions:", error);
      res.status(500).json({ message: "Failed to fetch executions" });
    }
  });

  app.patch("/api/trading-bots/:botId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { botId } = req.params;

      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.updateBot(botId, req.body);
      const updatedBot = await storage.getBot(botId);
      res.json(updatedBot);
    } catch (error) {
      console.error("Error updating bot:", error);
      res.status(500).json({ message: "Failed to update bot" });
    }
  });

  app.get("/api/bot-executions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bots = await storage.getUserBots(userId);
      const botIds = bots.map(b => b.id);
      
      const allExecutions = await Promise.all(
        botIds.map(id => storage.getBotExecutions(id))
      );
      
      const executions = allExecutions.flat();
      res.json(executions);
    } catch (error) {
      console.error("Error fetching all bot executions:", error);
      res.status(500).json({ message: "Failed to fetch executions" });
    }
  });

  // Bot Marketplace routes
  app.get("/api/bots/marketplace", isAuthenticated, async (req, res) => {
    try {
      const bots = await storage.getAllBots(100, 0);
      const botsWithStats = await Promise.all(
        bots.map(async (bot) => {
          const skills = await storage.getBotSkills(bot.id);
          const trainingSessions = await storage.getBotLearningSessions(bot.id);
          const totalXP = skills.reduce((sum, skill) => sum + (skill.experiencePoints || 0), 0);
          const avgLevel = skills.length > 0 
            ? skills.reduce((sum, skill) => sum + (skill.skillLevel || 0), 0) / skills.length 
            : 0;
          
          return {
            ...bot,
            totalSkills: skills.length,
            totalXP,
            avgLevel: Math.round(avgLevel),
            totalTrainingSessions: trainingSessions.length,
            completedSessions: trainingSessions.filter(s => s.status === 'completed').length,
          };
        })
      );
      res.json(botsWithStats);
    } catch (error) {
      console.error("Error fetching marketplace bots:", error);
      res.status(500).json({ message: "Failed to fetch marketplace bots" });
    }
  });

  app.get("/api/bots/:id/skills", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const skills = await storage.getBotSkills(id);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching bot skills:", error);
      res.status(500).json({ message: "Failed to fetch bot skills" });
    }
  });

  app.get("/api/bots/:id/training", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const sessions = await storage.getBotLearningSessions(id);
      const trainingData = await storage.getBotTrainingData(id);
      res.json({ sessions, trainingData });
    } catch (error) {
      console.error("Error fetching bot training:", error);
      res.status(500).json({ message: "Failed to fetch bot training" });
    }
  });

  app.post("/api/bots/:id/ask", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { question, answer } = req.body;
      const userId = req.user.claims.sub;

      if (!question || !answer) {
        return res.status(400).json({ message: "Question and answer required" });
      }

      // Record as training data
      const trainingData = await storage.createBotTrainingData({
        botId: id,
        dataType: 'user_interaction',
        input: question,
        expectedOutput: null,
        actualOutput: answer,
        reward: '10',
      });

      // Award XP for the interaction
      const skillResult = await botLearningService.progressBotSkill(id, 'user_interaction', 10, 'communication');

      // Emit real-time update
      websocketService.emitTradingEvent({
        type: 'bot_started',
        botId: id,
        data: { 
          message: 'Bot learned from user interaction',
          skillUpdate: skillResult,
          trainingData,
        },
      });

      res.json({ 
        success: true, 
        trainingData,
        skillUpdate: skillResult,
      });
    } catch (error) {
      console.error("Error recording bot question:", error);
      res.status(500).json({ message: "Failed to record question" });
    }
  });

  app.post("/api/bots/:id/answer", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { questionId, answer, context } = req.body;
      const userId = req.user.claims.sub;

      if (!answer) {
        return res.status(400).json({ message: "Answer is required" });
      }

      // Store the answer as training data with high reward for expert input
      const trainingData = await storage.createBotTrainingData({
        botId: id,
        dataType: 'expert_answer',
        input: context || questionId,
        expectedOutput: answer,
        actualOutput: answer,
        reward: '20', // Higher reward for expert answers
      });

      // Award bonus XP for expert knowledge
      const skillResult = await botLearningService.progressBotSkill(
        id, 
        'expert_knowledge', 
        20, 
        'learning'
      );

      // Update bot memory with the expert answer
      if (context) {
        await botLearningService.updateBotMemory(
          id,
          'expert_answers',
          questionId || `answer_${Date.now()}`,
          { question: context, answer, timestamp: new Date().toISOString() },
          90 // High confidence for expert answers
        );
      }

      res.json({ 
        success: true, 
        trainingData,
        skillUpdate: skillResult,
        message: 'Expert answer recorded successfully',
      });
    } catch (error) {
      console.error("Error recording bot answer:", error);
      res.status(500).json({ message: "Failed to record answer" });
    }
  });

  app.post("/api/bots/:id/train/manual", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { sessionType = 'supervised', trainingDataset, datasetFile } = req.body;

      // If dataset file is provided, store it as training data first
      if (datasetFile) {
        try {
          const dataset = JSON.parse(datasetFile);
          if (Array.isArray(dataset)) {
            for (const item of dataset.slice(0, 100)) { // Limit to 100 items per upload
              await storage.createBotTrainingData({
                botId: id,
                dataType: 'uploaded_dataset',
                input: item.input || item,
                expectedOutput: item.output || null,
                actualOutput: null,
                reward: '5',
              });
            }
          }
        } catch (parseError) {
          console.error("Error parsing dataset:", parseError);
        }
      }

      // Start learning session
      const sessionId = await botLearningService.startLearningSession(
        id,
        sessionType,
        trainingDataset || (datasetFile ? 'uploaded_dataset' : undefined)
      );

      if (!sessionId) {
        return res.status(500).json({ message: "Failed to start training session" });
      }

      // Simulate training progress with WebSocket updates
      setTimeout(async () => {
        const bot = await storage.getBot(id);
        if (bot) {
          const performanceAfter = {
            winRate: parseFloat(bot.winRate || "0") + Math.random() * 5,
            totalProfit: parseFloat(bot.totalProfit || "0") + Math.random() * 100,
            totalLoss: parseFloat(bot.totalLoss || "0"),
            totalTrades: (bot.totalTrades || 0) + 1,
            timestamp: new Date().toISOString(),
          };

          const result = await botLearningService.completeLearningSession(sessionId, performanceAfter);
          
          // Emit completion event
          websocketService.emitTradingEvent({
            type: 'execution_complete',
            botId: id,
            data: {
              sessionId,
              improved: result.improved,
              improvementRate: result.improvementRate,
            },
          });
        }
      }, 5000); // 5 seconds simulation

      res.json({ 
        success: true, 
        sessionId,
        message: 'Training session started',
      });
    } catch (error) {
      console.error("Error starting manual training:", error);
      res.status(500).json({ message: "Failed to start training" });
    }
  });

  // ===========================
  // Broker Integration Routes
  // ===========================

  // Connect broker account
  app.post("/api/broker/connect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { provider, apiKey, apiSecret, accountType } = req.body;

      if (!provider || !apiKey || !apiSecret) {
        return res.status(400).json({ message: "Missing required fields: provider, apiKey, apiSecret" });
      }

      const brokerAccount = await brokerIntegrationService.connectBroker(
        userId,
        provider,
        apiKey,
        apiSecret,
        accountType || "paper"
      );

      res.json(brokerAccount);
    } catch (error: any) {
      console.error("Error connecting broker:", error);
      res.status(500).json({ message: error.message || "Failed to connect broker" });
    }
  });

  // Get account info
  app.get("/api/broker/account/:accountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;

      const account = await storage.getBrokerAccount(accountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const accountInfo = await brokerIntegrationService.getAccountInfo(accountId);
      res.json(accountInfo);
    } catch (error: any) {
      console.error("Error fetching account info:", error);
      res.status(500).json({ message: error.message || "Failed to fetch account info" });
    }
  });

  // Get all broker accounts for user
  app.get("/api/broker/accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getUserBrokerAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching broker accounts:", error);
      res.status(500).json({ message: "Failed to fetch broker accounts" });
    }
  });

  // Place order
  app.post("/api/broker/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { brokerAccountId, symbol, qty, side, type, time_in_force, limit_price, stop_price } = req.body;

      const account = await storage.getBrokerAccount(brokerAccountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const order = await brokerIntegrationService.placeOrder(brokerAccountId, {
        symbol,
        qty,
        side,
        type,
        time_in_force,
        limit_price,
        stop_price,
      });

      res.json(order);
    } catch (error: any) {
      console.error("Error placing order:", error);
      res.status(500).json({ message: error.message || "Failed to place order" });
    }
  });

  // Get positions
  app.get("/api/broker/positions/:accountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;

      const account = await storage.getBrokerAccount(accountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const positions = await brokerIntegrationService.getPositions(accountId);
      res.json(positions);
    } catch (error: any) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch positions" });
    }
  });

  // Get order history
  app.get("/api/broker/history/:accountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;
      const { status, limit, after, until, direction } = req.query;

      const account = await storage.getBrokerAccount(accountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const orders = await brokerIntegrationService.getOrderHistory(accountId, {
        status: status as any,
        limit: limit ? parseInt(limit as string) : undefined,
        after: after as string,
        until: until as string,
        direction: direction as any,
      });

      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching order history:", error);
      res.status(500).json({ message: error.message || "Failed to fetch order history" });
    }
  });

  // Get market data
  app.get("/api/broker/market-data/:accountId/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId, symbol } = req.params;

      const account = await storage.getBrokerAccount(accountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const marketData = await brokerIntegrationService.getMarketData(accountId, symbol);
      res.json(marketData);
    } catch (error: any) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: error.message || "Failed to fetch market data" });
    }
  });

  // Cancel order
  app.delete("/api/broker/orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderId } = req.params;

      const order = await storage.getBrokerOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const account = await storage.getBrokerAccount(order.brokerAccountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const cancelledOrder = await brokerIntegrationService.cancelOrder(order.brokerAccountId, orderId);
      res.json(cancelledOrder);
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: error.message || "Failed to cancel order" });
    }
  });

  // Alpaca Broker routes - Direct integration with Alpaca paper trading
  app.post("/api/broker/alpaca/initialize", isAuthenticated, async (req: any, res) => {
    try {
      const { apiKey, secretKey } = req.body;
      
      if (!apiKey && !secretKey) {
        alpacaBrokerService.initialize();
      } else {
        alpacaBrokerService.initialize({
          keyId: apiKey,
          secretKey: secretKey,
          paper: true,
        });
      }
      
      res.json({ message: "Alpaca broker initialized successfully", paper: true });
    } catch (error: any) {
      console.error("Error initializing Alpaca:", error);
      res.status(500).json({ message: error.message || "Failed to initialize Alpaca" });
    }
  });

  app.get("/api/broker/alpaca/account", isAuthenticated, async (req: any, res) => {
    try {
      const account = await alpacaBrokerService.getAccount();
      res.json(account);
    } catch (error: any) {
      console.error("Error fetching Alpaca account:", error);
      res.status(500).json({ message: error.message || "Failed to fetch account" });
    }
  });

  app.get("/api/broker/alpaca/positions", isAuthenticated, async (req: any, res) => {
    try {
      const positions = await alpacaBrokerService.getPositions();
      res.json(positions);
    } catch (error: any) {
      console.error("Error fetching Alpaca positions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch positions" });
    }
  });

  app.get("/api/broker/alpaca/positions/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const position = await alpacaBrokerService.getPosition(symbol);
      if (!position) {
        return res.status(404).json({ message: `No position found for ${symbol}` });
      }
      res.json(position);
    } catch (error: any) {
      console.error("Error fetching Alpaca position:", error);
      res.status(500).json({ message: error.message || "Failed to fetch position" });
    }
  });

  app.post("/api/broker/alpaca/order", isAuthenticated, async (req: any, res) => {
    try {
      const {
        symbol,
        qty,
        notional,
        side,
        type,
        timeInForce,
        limitPrice,
        stopPrice,
        trailPrice,
        trailPercent,
        extendedHours,
        clientOrderId,
      } = req.body;

      if (!symbol || !side || !type) {
        return res.status(400).json({ 
          message: "Missing required fields: symbol, side, type" 
        });
      }

      const order = await alpacaBrokerService.placeOrder({
        symbol,
        qty: qty ? parseFloat(qty) : undefined,
        notional: notional ? parseFloat(notional) : undefined,
        side,
        type,
        timeInForce: timeInForce || 'day',
        limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
        stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
        trailPrice: trailPrice ? parseFloat(trailPrice) : undefined,
        trailPercent: trailPercent ? parseFloat(trailPercent) : undefined,
        extendedHours,
        clientOrderId,
      });

      res.json(order);
    } catch (error: any) {
      console.error("Error placing Alpaca order:", error);
      res.status(500).json({ message: error.message || "Failed to place order" });
    }
  });

  app.get("/api/broker/alpaca/orders", isAuthenticated, async (req: any, res) => {
    try {
      const { status, limit, after, until, direction, symbols } = req.query;
      
      const orders = await alpacaBrokerService.getOrders({
        status: status as any,
        limit: limit ? parseInt(limit as string) : undefined,
        after: after as string,
        until: until as string,
        direction: direction as any,
        symbols: symbols as string,
      });
      
      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching Alpaca orders:", error);
      res.status(500).json({ message: error.message || "Failed to fetch orders" });
    }
  });

  app.get("/api/broker/alpaca/orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const order = await alpacaBrokerService.getOrder(orderId);
      res.json(order);
    } catch (error: any) {
      console.error("Error fetching Alpaca order:", error);
      res.status(500).json({ message: error.message || "Failed to fetch order" });
    }
  });

  app.delete("/api/broker/alpaca/orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      await alpacaBrokerService.cancelOrder(orderId);
      res.json({ message: "Order cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling Alpaca order:", error);
      res.status(500).json({ message: error.message || "Failed to cancel order" });
    }
  });

  app.get("/api/broker/alpaca/historical/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const { timeframe, start, end, limit } = req.query;

      if (!timeframe || !start) {
        return res.status(400).json({ 
          message: "Missing required parameters: timeframe, start" 
        });
      }

      const bars = await alpacaBrokerService.getHistoricalBars({
        symbol,
        timeframe: timeframe as any,
        start: start as string,
        end: end as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(bars);
    } catch (error: any) {
      console.error("Error fetching historical bars:", error);
      res.status(500).json({ message: error.message || "Failed to fetch historical bars" });
    }
  });

  app.get("/api/broker/alpaca/quote/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const quote = await alpacaBrokerService.getLatestQuote(symbol);
      res.json(quote);
    } catch (error: any) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ message: error.message || "Failed to fetch quote" });
    }
  });

  app.get("/api/broker/alpaca/trade/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const trade = await alpacaBrokerService.getLatestTrade(symbol);
      res.json(trade);
    } catch (error: any) {
      console.error("Error fetching trade:", error);
      res.status(500).json({ message: error.message || "Failed to fetch trade" });
    }
  });

  app.get("/api/broker/alpaca/pnl", isAuthenticated, async (req: any, res) => {
    try {
      const pnl = await alpacaBrokerService.calculatePnL();
      res.json(pnl);
    } catch (error: any) {
      console.error("Error calculating PnL:", error);
      res.status(500).json({ message: error.message || "Failed to calculate PnL" });
    }
  });

  app.post("/api/broker/alpaca/close-position/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const { qty } = req.body;
      
      const order = await alpacaBrokerService.closePosition(symbol, qty ? parseFloat(qty) : undefined);
      res.json(order);
    } catch (error: any) {
      console.error("Error closing position:", error);
      res.status(500).json({ message: error.message || "Failed to close position" });
    }
  });

  app.post("/api/broker/alpaca/close-all-positions", isAuthenticated, async (req: any, res) => {
    try {
      const orders = await alpacaBrokerService.closeAllPositions();
      res.json({ message: "All positions closed", orders });
    } catch (error: any) {
      console.error("Error closing all positions:", error);
      res.status(500).json({ message: error.message || "Failed to close all positions" });
    }
  });

  app.get("/api/broker/alpaca/market-status", isAuthenticated, async (req: any, res) => {
    try {
      const isOpen = await alpacaBrokerService.isMarketOpen();
      res.json({ isOpen });
    } catch (error: any) {
      console.error("Error checking market status:", error);
      res.status(500).json({ message: error.message || "Failed to check market status" });
    }
  });

  app.get("/api/broker/alpaca/calendar", isAuthenticated, async (req: any, res) => {
    try {
      const { start, end } = req.query;
      const calendar = await alpacaBrokerService.getCalendar(start as string, end as string);
      res.json(calendar);
    } catch (error: any) {
      console.error("Error fetching calendar:", error);
      res.status(500).json({ message: error.message || "Failed to fetch calendar" });
    }
  });

  // Stock bot trading routes using Alpaca
  app.post("/api/stocks/trade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { symbol, action, quantity, orderType, limitPrice } = req.body;
      
      const order: TradeOrder = {
        symbol,
        action,
        quantity,
        orderType,
        limitPrice,
      };
      
      const result = await botStocks.placeOrder(userId, order);
      res.json(result);
    } catch (error: any) {
      console.error("Error placing stock order:", error);
      res.status(500).json({ message: error.message || "Failed to place stock order" });
    }
  });

  app.get("/api/stocks/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const portfolio = await botStocks.getPortfolio(userId);
      res.json(portfolio);
    } catch (error: any) {
      console.error("Error fetching stock portfolio:", error);
      res.status(500).json({ message: error.message || "Failed to fetch portfolio" });
    }
  });

  app.get("/api/stocks/quote/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const quote = await botStocks.getQuote(symbol);
      res.json(quote);
    } catch (error: any) {
      console.error("Error fetching stock quote:", error);
      res.status(500).json({ message: error.message || "Failed to fetch quote" });
    }
  });

  app.get("/api/stocks/orders", isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.query;
      const orders = await botStocks.getOrders(status as any);
      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: error.message || "Failed to fetch orders" });
    }
  });

  app.delete("/api/stocks/orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      await botStocks.cancelOrder(orderId);
      res.json({ message: "Order cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: error.message || "Failed to cancel order" });
    }
  });

  app.post("/api/stocks/close-position/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const { qty } = req.body;
      const result = await botStocks.closePosition(symbol, qty);
      res.json(result);
    } catch (error: any) {
      console.error("Error closing position:", error);
      res.status(500).json({ message: error.message || "Failed to close position" });
    }
  });

  // Armor Wallet routes
  app.post("/api/armor-wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletType, chains, dailyLimit, requiresTwoFa } = req.body;

      const wallet = await armorWalletService.createWallet(userId, {
        walletType,
        chains,
        dailyLimit,
        requiresTwoFa,
      });

      res.json(wallet);
    } catch (error: any) {
      console.error("Error creating Armor wallet:", error);
      res.status(500).json({ message: error.message || "Failed to create Armor wallet" });
    }
  });

  app.get("/api/armor-wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallets = await storage.getArmorWalletsByUserId(userId);
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching Armor wallets:", error);
      res.status(500).json({ message: "Failed to fetch Armor wallets" });
    }
  });

  app.post("/api/armor-wallets/:walletId/trade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId } = req.params;

      const wallet = await storage.getArmorWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await armorWalletService.executeTrade(walletId, req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Error executing Armor trade:", error);
      res.status(500).json({ message: error.message || "Trade execution failed" });
    }
  });

  app.post("/api/armor-wallets/:walletId/natural-language", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId } = req.params;
      const { command, chain } = req.body;

      const wallet = await storage.getArmorWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await armorWalletService.naturalLanguageTrade(walletId, command, chain);
      res.json(result);
    } catch (error: any) {
      console.error("Error executing natural language trade:", error);
      res.status(500).json({ message: error.message || "Natural language trade failed" });
    }
  });

  app.get("/api/armor-wallets/:walletId/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId } = req.params;

      const wallet = await storage.getArmorWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const portfolio = await armorWalletService.getPortfolio(walletId);
      res.json(portfolio);
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: error.message || "Failed to fetch portfolio" });
    }
  });

  // MEV monitoring routes
  app.get("/api/mev/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getMevEventsByUserId(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching MEV events:", error);
      res.status(500).json({ message: "Failed to fetch MEV events" });
    }
  });

  app.get("/api/mev/events/:network", isAuthenticated, async (req: any, res) => {
    try {
      const { network } = req.params;
      const events = await storage.getMevEventsByNetwork(network);
      res.json(events);
    } catch (error) {
      console.error("Error fetching MEV events by network:", error);
      res.status(500).json({ message: "Failed to fetch MEV events" });
    }
  });

  // Exchange Platform routes
  app.get("/api/exchange/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getExchangeOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching exchange orders:", error);
      res.status(500).json({ message: "Failed to fetch exchange orders" });
    }
  });

  app.post("/api/exchange/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertExchangeOrderSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid order data", 
          error: fromError(validation.error).toString() 
        });
      }
      const order = await storage.createExchangeOrder({ ...validation.data, userId });
      res.json(order);
    } catch (error) {
      console.error("Error creating exchange order:", error);
      res.status(500).json({ message: "Failed to create exchange order" });
    }
  });

  app.get("/api/exchange/liquidity-pools", isAuthenticated, async (req: any, res) => {
    try {
      const pools = await storage.getAllLiquidityPools();
      res.json(pools);
    } catch (error) {
      console.error("Error fetching liquidity pools:", error);
      res.status(500).json({ message: "Failed to fetch liquidity pools" });
    }
  });

  app.post("/api/exchange/liquidity-pools", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertLiquidityPoolSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid pool data", 
          error: fromError(validation.error).toString() 
        });
      }
      const pool = await storage.createLiquidityPool({ ...validation.data, userId });
      res.json(pool);
    } catch (error) {
      console.error("Error creating liquidity pool:", error);
      res.status(500).json({ message: "Failed to create liquidity pool" });
    }
  });

  // Coin Mixer routes
  app.get("/api/mixer/requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getMixingRequestsByUserId(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching mixing requests:", error);
      res.status(500).json({ message: "Failed to fetch mixing requests" });
    }
  });

  app.post("/api/mixer/requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertMixingRequestSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid mixing request data", 
          error: fromError(validation.error).toString() 
        });
      }
      const request = await storage.createMixingRequest({ ...validation.data, userId });
      res.json(request);
    } catch (error) {
      console.error("Error creating mixing request:", error);
      res.status(500).json({ message: "Failed to create mixing request" });
    }
  });

  // Forum/Community routes
  app.get("/api/forum/categories", isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getAllForumCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ message: "Failed to fetch forum categories" });
    }
  });

  app.get("/api/forum/threads", isAuthenticated, async (req: any, res) => {
    try {
      const threads = await storage.getAllForumThreads();
      res.json(threads);
    } catch (error) {
      console.error("Error fetching forum threads:", error);
      res.status(500).json({ message: "Failed to fetch forum threads" });
    }
  });

  app.post("/api/forum/threads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertForumThreadSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid thread data", 
          error: fromError(validation.error).toString() 
        });
      }
      const thread = await storage.createForumThread({ ...validation.data, userId });
      res.json(thread);
    } catch (error) {
      console.error("Error creating forum thread:", error);
      res.status(500).json({ message: "Failed to create forum thread" });
    }
  });

  app.get("/api/forum/replies", isAuthenticated, async (req: any, res) => {
    try {
      const replies = await storage.getAllForumReplies();
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Failed to fetch forum replies" });
    }
  });

  app.post("/api/forum/replies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertForumReplySchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid reply data", 
          error: fromError(validation.error).toString() 
        });
      }
      const reply = await storage.createForumReply({ ...validation.data, userId });
      res.json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create forum reply" });
    }
  });

  // Chat routes
  app.get("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertChatSessionSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid session data", 
          error: fromError(validation.error).toString() 
        });
      }
      const session = await storage.createChatSession({ ...validation.data, userId });
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get("/api/chat/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.query;
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ message: "Session ID required" });
      }
      const messages = await storage.getChatMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/messages", isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertChatMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid message data", 
          error: fromError(validation.error).toString() 
        });
      }
      const message = await storage.createChatMessage(validation.data);
      res.json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // Metals Trading routes
  app.get("/api/metals/inventory", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inventory = await storage.getMetalInventoryByUserId(userId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching metal inventory:", error);
      res.status(500).json({ message: "Failed to fetch metal inventory" });
    }
  });

  app.get("/api/metals/trades", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trades = await storage.getMetalTradesByUserId(userId);
      res.json(trades);
    } catch (error) {
      console.error("Error fetching metal trades:", error);
      res.status(500).json({ message: "Failed to fetch metal trades" });
    }
  });

  app.post("/api/metals/trades", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertMetalTradeSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid trade data", 
          error: fromError(validation.error).toString() 
        });
      }
      const trade = await storage.createMetalTrade({ ...validation.data, userId });
      res.json(trade);
    } catch (error) {
      console.error("Error creating metal trade:", error);
      res.status(500).json({ message: "Failed to create metal trade" });
    }
  });

  // Precious Metals Exchange - Crypto to Physical Conversion
  app.get("/api/metals/products", async (req: any, res) => {
    try {
      const products = await storage.getAllMetalProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching metal products:", error);
      res.status(500).json({ message: "Failed to fetch metal products" });
    }
  });

  app.post("/api/metals/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId, quantity, location, deliveryAddress, cryptoPaymentTx } = req.body;

      // Get product details
      const product = await storage.getMetalProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Get current spot price
      const metalData = await marketDataService.getMetalPrice(product.metal);
      const spotPrice = metalData.price;
      
      // Calculate purchase price with premium
      const premiumMultiplier = 1 + (Number(product.premium) / 100);
      const pricePerOz = spotPrice * premiumMultiplier;
      const totalPrice = pricePerOz * Number(product.weight) * quantity;

      // Create ownership record
      const ownership = await storage.createMetalOwnership({
        userId,
        productId,
        quantity,
        location: location || 'vault',
        purchasePrice: totalPrice.toFixed(2),
        spotPriceAtPurchase: spotPrice.toFixed(2),
        cryptoPaymentTx,
        deliveryAddress: location === 'delivery_pending' ? deliveryAddress : null,
      });

      res.json({...ownership, currentSpotPrice: spotPrice, purchasePrice: totalPrice });
    } catch (error: any) {
      console.error("Error purchasing metal:", error);
      res.status(500).json({ message: error.message || "Failed to purchase metal" });
    }
  });

  app.get("/api/metals/ownership", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ownership = await storage.getUserMetalOwnership(userId);
      res.json(ownership);
    } catch (error) {
      console.error("Error fetching metal ownership:", error);
      res.status(500).json({ message: "Failed to fetch metal ownership" });
    }
  });

  app.post("/api/metals/delivery", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { ownershipId, deliveryAddress } = req.body;

      // Verify ownership belongs to user
      const ownership = await storage.getMetalOwnership(ownershipId);
      if (!ownership || ownership.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update location to delivery pending
      await storage.updateMetalOwnershipLocation(ownershipId, 'delivery_pending', deliveryAddress);

      res.json({ success: true, message: "Delivery request submitted" });
    } catch (error) {
      console.error("Error requesting delivery:", error);
      res.status(500).json({ message: "Failed to request delivery" });
    }
  });

  // Financial Services routes - Stocks, Forex, Bonds, Retirement
  app.post("/api/financial/stocks/order", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { symbol, orderType, quantity, price } = req.body;

      // Get real-time stock price if market order
      const stockData = await marketDataService.getStockPrice(symbol);
      const executionPrice = orderType === "buy" ? stockData.price : price;
      const totalValue = executionPrice * quantity;

      // Create order
      const order = await storage.createFinancialOrder({
        userId,
        assetType: "stock",
        symbol,
        orderType,
        quantity: quantity.toString(),
        price: executionPrice.toString(),
        totalValue: totalValue.toString(),
        status: "executed",
        metadata: { stockData }
      });

      // Update or create holding
      const holdings = await storage.getFinancialHoldingsByAssetType(userId, "stock");
      const existing = holdings.find(h => h.symbol === symbol);

      if (orderType === "buy") {
        if (existing) {
          const newQuantity = parseFloat(existing.quantity) + quantity;
          const newTotalInvested = parseFloat(existing.totalInvested || "0") + totalValue;
          const newAvgPrice = newTotalInvested / newQuantity;
          await storage.updateFinancialHolding(userId, "stock", symbol, {
            quantity: newQuantity.toString(),
            averagePurchasePrice: newAvgPrice.toString(),
            totalInvested: newTotalInvested.toString(),
            currentValue: (newQuantity * stockData.price).toString()
          });
        } else {
          await storage.createFinancialHolding({
            userId,
            assetType: "stock",
            symbol,
            quantity: quantity.toString(),
            averagePurchasePrice: executionPrice.toString(),
            totalInvested: totalValue.toString(),
            currentValue: (quantity * stockData.price).toString()
          });
        }
      }

      await storage.updateFinancialOrderStatus(order.id, "executed");
      res.json(order);
    } catch (error: any) {
      console.error("Error placing stock order:", error);
      res.status(500).json({ message: error.message || "Failed to place stock order" });
    }
  });

  app.post("/api/financial/forex/order", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { pair, orderType, quantity } = req.body;

      const forexData = await marketDataService.getForexRate(pair);
      const totalValue = forexData.price * quantity;

      const order = await storage.createFinancialOrder({
        userId,
        assetType: "forex",
        symbol: pair,
        orderType,
        quantity: quantity.toString(),
        price: forexData.price.toString(),
        totalValue: totalValue.toString(),
        status: "executed",
        metadata: { forexData }
      });

      await storage.updateFinancialOrderStatus(order.id, "executed");
      res.json(order);
    } catch (error: any) {
      console.error("Error placing forex order:", error);
      res.status(500).json({ message: error.message || "Failed to place forex order" });
    }
  });

  app.post("/api/financial/bonds/order", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { symbol, quantity, price, maturityDate, yieldRate } = req.body;

      const totalValue = price * quantity;

      const order = await storage.createFinancialOrder({
        userId,
        assetType: "bond",
        symbol,
        orderType: "buy",
        quantity: quantity.toString(),
        price: price.toString(),
        totalValue: totalValue.toString(),
        status: "executed",
        metadata: { maturityDate, yieldRate }
      });

      const holdings = await storage.getFinancialHoldingsByAssetType(userId, "bond");
      const existing = holdings.find(h => h.symbol === symbol);

      if (existing) {
        const newQuantity = parseFloat(existing.quantity) + quantity;
        const newTotalInvested = parseFloat(existing.totalInvested || "0") + totalValue;
        await storage.updateFinancialHolding(userId, "bond", symbol, {
          quantity: newQuantity.toString(),
          totalInvested: newTotalInvested.toString()
        });
      } else {
        await storage.createFinancialHolding({
          userId,
          assetType: "bond",
          symbol,
          quantity: quantity.toString(),
          averagePurchasePrice: price.toString(),
          totalInvested: totalValue.toString(),
          metadata: { maturityDate, yieldRate }
        });
      }

      await storage.updateFinancialOrderStatus(order.id, "executed");
      res.json(order);
    } catch (error: any) {
      console.error("Error placing bond order:", error);
      res.status(500).json({ message: error.message || "Failed to place bond order" });
    }
  });

  app.post("/api/financial/metals/order", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { metal, orderType, quantity } = req.body;

      const metalData = await marketDataService.getMetalPrice(metal);
      const totalValue = metalData.price * quantity;

      const order = await storage.createFinancialOrder({
        userId,
        assetType: "stock", // Using stock for now as metals don't have their own type
        symbol: metal.toUpperCase(),
        orderType,
        quantity: quantity.toString(),
        price: metalData.price.toString(),
        totalValue: totalValue.toString(),
        status: "executed",
        metadata: { metalData, isMetal: true }
      });

      await storage.updateFinancialOrderStatus(order.id, "executed");
      res.json(order);
    } catch (error: any) {
      console.error("Error placing metals order:", error);
      res.status(500).json({ message: error.message || "Failed to place metals order" });
    }
  });

  app.get("/api/financial/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const holdings = await storage.getFinancialHoldingsByUserId(userId);
      const orders = await storage.getFinancialOrdersByUserId(userId);

      res.json({
        holdings,
        orders,
        totalValue: holdings.reduce((sum, h) => sum + parseFloat(h.currentValue || "0"), 0)
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.get("/api/financial/holdings/:assetType", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { assetType } = req.params;
      const holdings = await storage.getFinancialHoldingsByAssetType(userId, assetType);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ message: "Failed to fetch holdings" });
    }
  });

  app.get("/api/financial/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getFinancialOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Market data endpoints
  app.get("/api/market/stock/:symbol", async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const data = await marketDataService.getStockPrice(symbol);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching stock data:", error);
      res.status(500).json({ message: error.message || "Failed to fetch stock data" });
    }
  });

  app.get("/api/market/forex/:pair", async (req: any, res) => {
    try {
      const { pair } = req.params;
      const data = await marketDataService.getForexRate(pair);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching forex data:", error);
      res.status(500).json({ message: error.message || "Failed to fetch forex data" });
    }
  });

  app.get("/api/market/metal/:metal", async (req: any, res) => {
    try {
      const { metal } = req.params;
      const data = await marketDataService.getMetalPrice(metal);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching metal data:", error);
      res.status(500).json({ message: error.message || "Failed to fetch metal data" });
    }
  });

  app.get("/api/market/bonds/treasury", async (req: any, res) => {
    try {
      const data = await marketDataService.getTreasuryYields();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching treasury yields:", error);
      res.status(500).json({ message: error.message || "Failed to fetch treasury yields" });
    }
  });

  app.post("/api/financial/retirement/contribute", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountType, amount, frequency } = req.body;

      const order = await storage.createFinancialOrder({
        userId,
        assetType: "retirement",
        symbol: accountType.toUpperCase().replace("_", ""),
        orderType: "buy",
        quantity: "1",
        price: amount.toString(),
        totalValue: amount.toString(),
        status: "executed",
        metadata: { frequency, accountType }
      });

      await storage.updateFinancialOrderStatus(order.id, "executed");
      res.json(order);
    } catch (error: any) {
      console.error("Error processing retirement contribution:", error);
      res.status(500).json({ message: error.message || "Failed to process contribution" });
    }
  });

  // Blog/News routes
  app.get("/api/blog/posts", async (req: any, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/blog/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only admins can create blog posts
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validation = insertBlogPostSchema.omit({ authorId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid blog post data", 
          error: fromError(validation.error).toString() 
        });
      }
      const post = await storage.createBlogPost({ ...validation.data, authorId: userId });
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Dashboard System Routes
  app.get("/api/dashboard/config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const config = await storage.getUserDashboardConfig(userId);
      res.json(config || null);
    } catch (error) {
      console.error("Error fetching dashboard config:", error);
      res.status(500).json({ message: "Failed to fetch dashboard config" });
    }
  });

  app.post("/api/dashboard/config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertUserDashboardConfigSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid dashboard config", 
          error: fromError(validation.error).toString() 
        });
      }
      const config = await storage.createOrUpdateDashboardConfig({
        ...validation.data,
        userId,
      });
      res.json(config);
    } catch (error) {
      console.error("Error saving dashboard config:", error);
      res.status(500).json({ message: "Failed to save dashboard config" });
    }
  });

  app.get("/api/dashboard/widgets", isAuthenticated, async (req: any, res) => {
    try {
      const widgets = await storage.getDashboardWidgets();
      res.json(widgets);
    } catch (error) {
      console.error("Error fetching widgets:", error);
      res.status(500).json({ message: "Failed to fetch widgets" });
    }
  });

  app.post("/api/dashboard/widgets", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validation = insertDashboardWidgetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid widget data", 
          error: fromError(validation.error).toString() 
        });
      }
      const widget = await storage.createDashboardWidget(validation.data);
      res.status(201).json(widget);
    } catch (error) {
      console.error("Error creating widget:", error);
      res.status(500).json({ message: "Failed to create widget" });
    }
  });

  app.get("/api/dashboard/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserWidgetPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching widget preferences:", error);
      res.status(500).json({ message: "Failed to fetch widget preferences" });
    }
  });

  app.post("/api/dashboard/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertUserWidgetPreferenceSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid preference data", 
          error: fromError(validation.error).toString() 
        });
      }
      const preference = await storage.createOrUpdateWidgetPreference({
        ...validation.data,
        userId,
      });
      res.status(201).json(preference);
    } catch (error) {
      console.error("Error saving widget preference:", error);
      res.status(500).json({ message: "Failed to save widget preference" });
    }
  });

  app.delete("/api/dashboard/preferences/:widgetId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { widgetId } = req.params;
      const deleted = await storage.deleteWidgetPreference(userId, widgetId);
      if (!deleted) {
        return res.status(404).json({ message: "Widget preference not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting widget preference:", error);
      res.status(500).json({ message: "Failed to delete widget preference" });
    }
  });

  // Admin Panel Routes (all require admin access)
  app.get("/api/admin/users", isAuthenticated, isAdmin, isSuperAdmin, async (req: any, res) => {
    try {
      const adminUsers = await storage.getAllAdminUsers();
      res.json(adminUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, isAdmin, isSuperAdmin, async (req: any, res) => {
    try {
      const adminUser = req.adminUser;
      
      const validation = insertAdminUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid admin user data", 
          error: fromError(validation.error).toString() 
        });
      }
      
      // Check if admin user already exists
      const exists = await storage.adminUserExists(validation.data.userId);
      if (exists) {
        return res.status(409).json({ message: "Admin user already exists" });
      }
      
      // Verify target user exists in users table
      const targetUser = await storage.getUser(validation.data.userId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }
      
      const newAdmin = await storage.createAdminUser(validation.data);
      
      // Log admin creation
      await storage.createAdminAuditLog({
        adminId: adminUser.id,
        action: "create_admin",
        targetType: "admin_user",
        targetId: newAdmin.id,
        details: { role: newAdmin.role, targetUserId: newAdmin.userId },
      });
      
      res.status(201).json(newAdmin);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  app.patch("/api/admin/users/:userId/role", isAuthenticated, isAdmin, isSuperAdmin, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const adminUser = req.adminUser;
      const { userId } = req.params;
      const { role } = req.body;
      
      // Prevent self-escalation
      if (userId === requesterId) {
        return res.status(403).json({ message: "Cannot modify your own role" });
      }
      
      // Validate role enum
      if (!["super_admin", "admin", "moderator", "support"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Check target exists
      const targetAdmin = await storage.getAdminUser(userId);
      if (!targetAdmin) {
        return res.status(404).json({ message: "Target admin user not found" });
      }
      
      // Prevent demoting the only super_admin
      if (targetAdmin.role === "super_admin" && role !== "super_admin") {
        const allAdmins = await storage.getAllAdminUsers();
        const superAdminCount = allAdmins.filter(a => a.role === "super_admin").length;
        if (superAdminCount <= 1) {
          return res.status(403).json({ message: "Cannot demote the only super admin" });
        }
      }
      
      const updated = await storage.updateAdminRole(userId, role);
      if (!updated) {
        return res.status(404).json({ message: "Failed to update role" });
      }
      
      // Log role change
      await storage.createAdminAuditLog({
        adminId: adminUser.id,
        action: "update_role",
        targetType: "admin_user",
        targetId: targetAdmin.id,
        details: { oldRole: targetAdmin.role, newRole: role, targetUserId: userId },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating admin role:", error);
      res.status(500).json({ message: "Failed to update admin role" });
    }
  });

  app.get("/api/admin/audit-logs", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAdminAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.post("/api/admin/audit-logs", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const adminUser = req.adminUser;
      
      const validation = insertAdminAuditLogSchema.omit({ adminId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid audit log data", 
          error: fromError(validation.error).toString() 
        });
      }
      
      const log = await storage.createAdminAuditLog({
        ...validation.data,
        adminId: adminUser.id,
      });
      
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(500).json({ message: "Failed to create audit log" });
    }
  });

  app.get("/api/admin/broadcasts", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const broadcasts = await storage.getAdminBroadcasts(limit);
      res.json(broadcasts);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      res.status(500).json({ message: "Failed to fetch broadcasts" });
    }
  });

  app.post("/api/admin/broadcasts", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const adminUser = req.adminUser;
      
      // Only super_admin and admin can create broadcasts
      if (!["super_admin", "admin"].includes(adminUser.role)) {
        return res.status(403).json({ message: "Admin or super admin access required" });
      }
      
      const validation = insertAdminBroadcastSchema.omit({ adminId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid broadcast data", 
          error: fromError(validation.error).toString() 
        });
      }
      
      const broadcast = await storage.createAdminBroadcast({
        ...validation.data,
        adminId: adminUser.id,
      });
      
      // Log broadcast creation
      await storage.createAdminAuditLog({
        adminId: adminUser.id,
        action: "create_broadcast",
        targetType: "broadcast",
        targetId: broadcast.id,
        details: { title: broadcast.title },
      });
      
      res.status(201).json(broadcast);
    } catch (error) {
      console.error("Error creating broadcast:", error);
      res.status(500).json({ message: "Failed to create broadcast" });
    }
  });

  app.patch("/api/admin/broadcasts/:id/send", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const adminUser = req.adminUser;
      const { id } = req.params;
      
      await storage.markBroadcastAsSent(id);
      
      // Log broadcast send
      await storage.createAdminAuditLog({
        adminId: adminUser.id,
        action: "send_broadcast",
        targetType: "broadcast",
        targetId: id,
        details: { broadcastId: id },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending broadcast:", error);
      res.status(500).json({ message: "Failed to send broadcast" });
    }
  });

  // Bot Marketplace Routes
  app.get("/api/bot-marketplace/listings", isAuthenticated, async (req: any, res) => {
    try {
      const listings = await storage.getBotMarketplaceListings();
      res.json(listings);
    } catch (error) {
      console.error("Error fetching bot listings:", error);
      res.status(500).json({ message: "Failed to fetch bot listings" });
    }
  });

  app.get("/api/bot-marketplace/listings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const listing = await storage.getBotMarketplaceListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error fetching bot listing:", error);
      res.status(500).json({ message: "Failed to fetch bot listing" });
    }
  });

  app.post("/api/bot-marketplace/listings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertBotMarketplaceListingSchema.omit({ sellerId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid listing data", 
          error: fromError(validation.error).toString() 
        });
      }
      const listing = await storage.createBotMarketplaceListing({
        ...validation.data,
        sellerId: userId,
      });
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating bot listing:", error);
      res.status(500).json({ message: "Failed to create bot listing" });
    }
  });

  app.patch("/api/bot-marketplace/listings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validation = insertBotMarketplaceListingSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          error: fromError(validation.error).toString() 
        });
      }
      const updated = await storage.updateBotMarketplaceListing(id, validation.data);
      if (!updated) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating bot listing:", error);
      res.status(500).json({ message: "Failed to update bot listing" });
    }
  });

  // Bot Rentals Routes
  app.get("/api/bot-rentals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rentals = await storage.getUserBotRentals(userId);
      res.json(rentals);
    } catch (error) {
      console.error("Error fetching bot rentals:", error);
      res.status(500).json({ message: "Failed to fetch bot rentals" });
    }
  });

  app.post("/api/bot-rentals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertBotRentalSchema.omit({ renterId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid rental data", 
          error: fromError(validation.error).toString() 
        });
      }
      const rental = await storage.createBotRental({
        ...validation.data,
        renterId: userId,
      });
      res.status(201).json(rental);
    } catch (error) {
      console.error("Error creating bot rental:", error);
      res.status(500).json({ message: "Failed to create bot rental" });
    }
  });

  // Bot Subscriptions Routes
  app.get("/api/bot-subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await storage.getUserBotSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching bot subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch bot subscriptions" });
    }
  });

  app.post("/api/bot-subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertBotSubscriptionSchema.omit({ subscriberId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid subscription data", 
          error: fromError(validation.error).toString() 
        });
      }
      const subscription = await storage.createBotSubscription({
        ...validation.data,
        subscriberId: userId,
      });
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating bot subscription:", error);
      res.status(500).json({ message: "Failed to create bot subscription" });
    }
  });

  // Bot Reviews Routes
  app.get("/api/bot-reviews/:listingId", isAuthenticated, async (req: any, res) => {
    try {
      const { listingId } = req.params;
      const reviews = await storage.getBotReviews(listingId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching bot reviews:", error);
      res.status(500).json({ message: "Failed to fetch bot reviews" });
    }
  });

  app.post("/api/bot-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertBotReviewSchema.omit({ reviewerId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid review data", 
          error: fromError(validation.error).toString() 
        });
      }
      const review = await storage.createBotReview({
        ...validation.data,
        reviewerId: userId,
      });
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating bot review:", error);
      res.status(500).json({ message: "Failed to create bot review" });
    }
  });

  // Bot Learning Routes
  app.get("/api/bot-learning/:botId/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const sessions = await storage.getBotLearningSessions(botId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching learning sessions:", error);
      res.status(500).json({ message: "Failed to fetch learning sessions" });
    }
  });

  app.post("/api/bot-learning/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertBotLearningSessionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid session data", 
          error: fromError(validation.error).toString() 
        });
      }
      const session = await storage.createBotLearningSession(validation.data);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating learning session:", error);
      res.status(500).json({ message: "Failed to create learning session" });
    }
  });

  app.patch("/api/bot-learning/sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validation = insertBotLearningSessionSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          error: fromError(validation.error).toString() 
        });
      }
      const updated = await storage.updateBotLearningSession(id, validation.data);
      if (!updated) {
        return res.status(404).json({ message: "Learning session not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating learning session:", error);
      res.status(500).json({ message: "Failed to update learning session" });
    }
  });

  app.post("/api/bot-learning/training-data", isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertBotTrainingDataSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid training data", 
          error: fromError(validation.error).toString() 
        });
      }
      const data = await storage.createBotTrainingData(validation.data);
      res.status(201).json(data);
    } catch (error) {
      console.error("Error creating training data:", error);
      res.status(500).json({ message: "Failed to create training data" });
    }
  });

  app.get("/api/bot-learning/training-data/:botId", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const data = await storage.getBotTrainingData(botId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching training data:", error);
      res.status(500).json({ message: "Failed to fetch training data" });
    }
  });

  // Bot Skills Routes
  app.get("/api/bot-skills/:botId", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const skills = await storage.getBotSkills(botId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching bot skills:", error);
      res.status(500).json({ message: "Failed to fetch bot skills" });
    }
  });

  app.post("/api/bot-skills", isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertBotSkillSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid skill data", 
          error: fromError(validation.error).toString() 
        });
      }
      const skill = await storage.createBotSkill(validation.data);
      res.status(201).json(skill);
    } catch (error) {
      console.error("Error creating bot skill:", error);
      res.status(500).json({ message: "Failed to create bot skill" });
    }
  });

  // P2P Trading Routes

  // P2P Offers
  app.get("/api/p2p/offers", isAuthenticated, async (req: any, res) => {
    try {
      const type = req.query.type as string | undefined;
      const offers = await storage.getP2POffers(type);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching P2P offers:", error);
      res.status(500).json({ message: "Failed to fetch P2P offers" });
    }
  });

  app.get("/api/p2p/offers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const offer = await storage.getP2POffer(id);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json(offer);
    } catch (error) {
      console.error("Error fetching P2P offer:", error);
      res.status(500).json({ message: "Failed to fetch P2P offer" });
    }
  });

  app.post("/api/p2p/offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertP2POfferSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid offer data", 
          error: fromError(validation.error).toString() 
        });
      }
      const offer = await storage.createP2POffer({
        ...validation.data,
        userId,
      });
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating P2P offer:", error);
      res.status(500).json({ message: "Failed to create P2P offer" });
    }
  });

  app.patch("/api/p2p/offers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validation = insertP2POfferSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          error: fromError(validation.error).toString() 
        });
      }
      const updated = await storage.updateP2POffer(id, validation.data);
      if (!updated) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating P2P offer:", error);
      res.status(500).json({ message: "Failed to update P2P offer" });
    }
  });

  // P2P Orders
  app.get("/api/p2p/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getP2POrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching P2P orders:", error);
      res.status(500).json({ message: "Failed to fetch P2P orders" });
    }
  });

  app.get("/api/p2p/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getP2POrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching P2P order:", error);
      res.status(500).json({ message: "Failed to fetch P2P order" });
    }
  });

  app.post("/api/p2p/orders", isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertP2POrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid order data", 
          error: fromError(validation.error).toString() 
        });
      }
      
      // Create order with initial status
      const order = await storage.createP2POrder({
        ...validation.data,
        status: "created",
      });

      // Note: In production, implement blockchain escrow here
      // For now, we track escrow status in the database
      // Future implementation would:
      // 1. Deploy escrow smart contract
      // 2. Lock seller's funds in escrow
      // 3. Store escrow contract address and tx hash
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating P2P order:", error);
      res.status(500).json({ message: "Failed to create P2P order" });
    }
  });

  // Escrow endpoints
  app.post("/api/p2p/orders/:id/escrow", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { txHash } = req.body;
      
      // Update order with escrow transaction hash
      await storage.updateP2POrder(id, {
        status: "escrowed",
        escrowTxHash: txHash,
      });
      
      websocketService.emitP2POrderUpdate(id, { status: "escrowed" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating escrow:", error);
      res.status(500).json({ message: "Failed to update escrow" });
    }
  });

  app.post("/api/p2p/orders/:id/release", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { txHash } = req.body;
      
      // Release funds from escrow
      await storage.updateP2POrder(id, {
        status: "completed",
        releaseTxHash: txHash,
        completedAt: new Date(),
      });
      
      websocketService.emitP2POrderUpdate(id, { status: "completed" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error releasing funds:", error);
      res.status(500).json({ message: "Failed to release funds" });
    }
  });

  app.post("/api/p2p/orders/:id/mark-paid", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Buyer marks payment as sent
      await storage.updateP2POrder(id, {
        status: "paid",
        paidAt: new Date(),
      });
      
      websocketService.emitP2POrderUpdate(id, { status: "paid" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking as paid:", error);
      res.status(500).json({ message: "Failed to mark as paid" });
    }
  });

  app.patch("/api/p2p/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validation = insertP2POrderSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          error: fromError(validation.error).toString() 
        });
      }
      const updated = await storage.updateP2POrder(id, validation.data);
      if (!updated) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating P2P order:", error);
      res.status(500).json({ message: "Failed to update P2P order" });
    }
  });

  // P2P Payment Methods
  app.get("/api/p2p/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const methods = await storage.getUserP2PPaymentMethods(userId);
      res.json(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/p2p/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertP2PPaymentMethodSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid payment method data", 
          error: fromError(validation.error).toString() 
        });
      }
      const method = await storage.createP2PPaymentMethod({
        ...validation.data,
        userId,
      });
      res.status(201).json(method);
    } catch (error) {
      console.error("Error creating payment method:", error);
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });

  // P2P Chat
  app.get("/api/p2p/chat/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const messages = await storage.getOrderChatMessages(orderId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/p2p/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertP2PChatMessageSchema.omit({ senderId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid message data", 
          error: fromError(validation.error).toString() 
        });
      }
      const message = await storage.createP2PChatMessage({
        ...validation.data,
        senderId: userId,
      });
      
      // Emit WebSocket event for real-time chat
      websocketService.emitP2PChatMessage(message.orderId, message);
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // P2P Messages (aliases for chat endpoints)
  app.get("/api/p2p/messages/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const messages = await storage.getOrderChatMessages(orderId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/p2p/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertP2PChatMessageSchema.omit({ senderId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid message data", 
          error: fromError(validation.error).toString() 
        });
      }
      const message = await storage.createP2PChatMessage({
        ...validation.data,
        senderId: userId,
      });
      
      // Emit WebSocket event for real-time chat
      websocketService.emitP2PChatMessage(message.orderId, message);
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // P2P Disputes
  app.get("/api/p2p/disputes", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const status = req.query.status as string | undefined;
      const disputes = await storage.getP2PDisputes(status);
      res.json(disputes);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  app.post("/api/p2p/disputes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertP2PDisputeSchema.omit({ raisedBy: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid dispute data", 
          error: fromError(validation.error).toString() 
        });
      }
      const dispute = await storage.createP2PDispute({
        ...validation.data,
        raisedBy: userId,
      });
      res.status(201).json(dispute);
    } catch (error) {
      console.error("Error creating dispute:", error);
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });

  app.patch("/api/p2p/disputes/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validation = insertP2PDisputeSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          error: fromError(validation.error).toString() 
        });
      }
      const updated = await storage.updateP2PDispute(id, validation.data);
      if (!updated) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating dispute:", error);
      res.status(500).json({ message: "Failed to update dispute" });
    }
  });

  // P2P Reviews
  app.get("/api/p2p/reviews/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getUserP2PReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/p2p/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertP2PReviewSchema.omit({ reviewerId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid review data", 
          error: fromError(validation.error).toString() 
        });
      }
      const review = await storage.createP2PReview({
        ...validation.data,
        reviewerId: userId,
      });
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // WalletConnect Routes
  app.get("/api/walletconnect/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getWalletConnectSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching wallet sessions:", error);
      res.status(500).json({ message: "Failed to fetch wallet sessions" });
    }
  });

  app.post("/api/walletconnect/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertWalletConnectSessionSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid session data", 
          error: fromError(validation.error).toString() 
        });
      }

      // Check if active session exists for this wallet
      const existingSession = await storage.getActiveWalletSession(userId, validation.data.walletAddress);
      if (existingSession) {
        // Update last used time
        await storage.updateWalletSessionStatus(existingSession.id, "active");
        return res.json(existingSession);
      }

      const session = await storage.createWalletConnectSession({
        ...validation.data,
        userId,
      });
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating wallet session:", error);
      res.status(500).json({ message: "Failed to create wallet session" });
    }
  });

  app.patch("/api/walletconnect/sessions/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["active", "expired", "disconnected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await storage.updateWalletSessionStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating session status:", error);
      res.status(500).json({ message: "Failed to update session status" });
    }
  });

  app.post("/api/walletconnect/sessions/:id/disconnect", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const disconnected = await storage.disconnectWalletSession(id);
      if (!disconnected) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting session:", error);
      res.status(500).json({ message: "Failed to disconnect session" });
    }
  });

  // Alternative DELETE endpoint for WalletConnect session (as per spec)
  app.delete("/api/walletconnect/session/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const disconnected = await storage.disconnectWalletSession(id);
      if (!disconnected) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json({ success: true, message: "Session disconnected successfully" });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Market Data Routes - Real-time financial data integration
  app.get("/api/market/stocks/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const data = await marketDataService.getStockPrice(symbol);
      res.json(data);
    } catch (error) {
      console.error("Error fetching stock price:", error);
      res.status(500).json({ message: "Failed to fetch stock price" });
    }
  });

  app.get("/api/market/forex/:pair", isAuthenticated, async (req: any, res) => {
    try {
      const { pair } = req.params;
      const data = await marketDataService.getForexRate(pair);
      res.json(data);
    } catch (error) {
      console.error("Error fetching forex rate:", error);
      res.status(500).json({ message: "Failed to fetch forex rate" });
    }
  });

  app.get("/api/market/metals/:metal", isAuthenticated, async (req: any, res) => {
    try {
      const { metal } = req.params;
      const data = await marketDataService.getMetalPrice(metal);
      res.json(data);
    } catch (error) {
      console.error("Error fetching metal price:", error);
      res.status(500).json({ message: "Failed to fetch metal price" });
    }
  });

  app.get("/api/market/bonds/treasury", isAuthenticated, async (req: any, res) => {
    try {
      const data = await marketDataService.getTreasuryYields();
      res.json(data);
    } catch (error) {
      console.error("Error fetching treasury yields:", error);
      res.status(500).json({ message: "Failed to fetch treasury yields" });
    }
  });

  // Market data cache management (admin only)
  app.post("/api/market/cache/clear", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      marketDataService.clearCache();
      res.json({ success: true, message: "Market data cache cleared" });
    } catch (error) {
      console.error("Error clearing cache:", error);
      res.status(500).json({ message: "Failed to clear cache" });
    }
  });

  app.get("/api/market/cache/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = marketDataService.getCacheStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      res.status(500).json({ message: "Failed to fetch cache stats" });
    }
  });

  // ============================================
  // ADMIN CONTROL PANEL ROUTES
  // ============================================

  // Get all users with pagination
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const users = await storage.getAllUsers(limit, offset);
      const total = await storage.getTotalUsersCount();
      
      res.json({ users, total, limit, offset });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user status (suspend/activate/make admin)
  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isAdmin: makeAdmin } = req.body;
      
      await storage.updateUserStatus(id, makeAdmin);
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.adminUser.id,
        action: makeAdmin ? "user_promoted_to_admin" : "user_demoted_from_admin",
        targetType: "user",
        targetId: id,
        details: { isAdmin: makeAdmin },
        ipAddress: req.ip,
      });
      
      res.json({ success: true, message: "User status updated" });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Get all bots with training stats
  app.get("/api/admin/bots", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const bots = await storage.getAllBots(limit, offset);
      const total = await storage.getTotalBotsCount();
      
      res.json({ bots, total, limit, offset });
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  // Get bot training details
  app.get("/api/admin/bots/:id/training", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const sessions = await storage.getBotLearningSessions(id);
      const skills = await storage.getBotSkills(id);
      const trainingData = await storage.getBotTrainingData(id);
      
      res.json({ sessions, skills, trainingData });
    } catch (error) {
      console.error("Error fetching bot training details:", error);
      res.status(500).json({ message: "Failed to fetch bot training details" });
    }
  });

  // Start training session for a bot
  app.post("/api/admin/bots/:id/train", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { sessionType, trainingDataset } = req.body;
      
      const bot = await storage.getBot(id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      // Create learning session
      const performanceBefore = {
        winRate: parseFloat(bot.winRate || "0"),
        totalProfit: parseFloat(bot.totalProfit || "0"),
        totalLoss: parseFloat(bot.totalLoss || "0"),
        totalTrades: bot.totalTrades || 0,
        timestamp: new Date().toISOString(),
      };
      
      const session = await storage.createBotLearningSession({
        botId: id,
        sessionType: sessionType || "supervised",
        trainingDataset,
        status: "training",
        performanceBefore,
        performanceAfter: null,
        improvementRate: null,
        completedAt: null,
      });
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.adminUser.id,
        action: "bot_training_started",
        targetType: "bot",
        targetId: id,
        details: { sessionType, sessionId: session.id },
        ipAddress: req.ip,
      });
      
      res.json({ success: true, session });
    } catch (error) {
      console.error("Error starting training session:", error);
      res.status(500).json({ message: "Failed to start training session" });
    }
  });

  // Send message to users (broadcast)
  app.post("/api/admin/chat/send", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { recipientType, recipientIds, message, title, priority } = req.body;
      
      const broadcast = await storage.createAdminBroadcast({
        adminId: req.adminUser.id,
        recipientType,
        recipientIds: recipientIds || [],
        message,
        title,
        priority: priority || "normal",
      });
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.adminUser.id,
        action: "message_broadcast",
        targetType: "broadcast",
        targetId: broadcast.id,
        details: { recipientType, recipientCount: recipientIds?.length || 0 },
        ipAddress: req.ip,
      });
      
      // TODO: Send via WebSocket to online users
      // websocketService.sendBroadcast(recipientIds, message);
      
      res.json({ success: true, broadcast });
    } catch (error) {
      console.error("Error sending broadcast message:", error);
      res.status(500).json({ message: "Failed to send broadcast message" });
    }
  });

  // Get system analytics
  app.get("/api/admin/analytics", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const totalUsers = await storage.getTotalUsersCount();
      const totalBots = await storage.getTotalBotsCount();
      
      // Get active bots (isActive = true)
      const allBots = await storage.getAllBots(1000, 0);
      const activeBots = allBots.filter(b => b.isActive).length;
      
      // Get learning sessions count
      const recentBots = await storage.getAllBots(100, 0);
      const learningSessions = await Promise.all(
        recentBots.map(b => storage.getBotLearningSessions(b.id))
      );
      const totalLearningSessions = learningSessions.reduce((sum, sessions) => sum + sessions.length, 0);
      
      // Performance metrics
      const avgWinRate = allBots.reduce((sum, b) => sum + parseFloat(b.winRate || "0"), 0) / (allBots.length || 1);
      const avgSkillLevel = allBots.reduce((sum, b) => sum + (b.avgSkillLevel || 0), 0) / (allBots.length || 1);
      
      res.json({
        totalUsers,
        totalBots,
        activeBots,
        totalLearningSessions,
        avgWinRate: avgWinRate.toFixed(2),
        avgSkillLevel: avgSkillLevel.toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get admin audit logs
  app.get("/api/admin/audit-logs", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAdminAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Celebrity Platform Routes (TWinn System)
  // GET /api/celebrities - List all verified celebrities
  app.get("/api/celebrities", isAuthenticated, async (req: any, res) => {
    try {
      const { status = "verified" } = req.query;
      const celebrities = await storage.getAllCelebrityProfiles(status);
      
      // Get follow status for current user
      const userId = req.user.claims.sub;
      const userFollows = await storage.getUserFollows(userId);
      const followedIds = new Set(userFollows.map(f => f.celebrityId));
      
      const celebritiesWithFollowStatus = celebrities.map(celeb => ({
        ...celeb,
        isFollowing: followedIds.has(celeb.id),
      }));
      
      res.json(celebritiesWithFollowStatus);
    } catch (error) {
      console.error("Error fetching celebrities:", error);
      res.status(500).json({ message: "Failed to fetch celebrities" });
    }
  });

  // GET /api/celebrities/:id - Get celebrity profile
  app.get("/api/celebrities/:id", isAuthenticated, async (req: any, res) => {
    try {
      const celebrityId = req.params.id;
      const userId = req.user.claims.sub;
      
      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      // Check if current user is following
      const isFollowing = await storage.isFollowing(userId, celebrityId);
      
      // Get user's stake info
      const userStakes = await storage.getUserStakes(userId);
      const activeStake = userStakes.find(s => s.celebrityId === celebrityId && s.status === "active");
      
      res.json({
        ...celebrity,
        isFollowing,
        userStake: activeStake || null,
      });
    } catch (error) {
      console.error("Error fetching celebrity:", error);
      res.status(500).json({ message: "Failed to fetch celebrity" });
    }
  });

  // POST /api/celebrities - Create celebrity profile (verified users only)
  app.post("/api/celebrities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user's KYC is approved
      if (user?.kycStatus !== "approved") {
        return res.status(403).json({ message: "KYC verification required to create celebrity profile" });
      }

      // Check if user already has a celebrity profile
      const existingProfile = await storage.getCelebrityProfileByUserId(userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Celebrity profile already exists" });
      }

      const validation = insertCelebrityProfileSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid celebrity profile data", 
          error: fromError(validation.error).toString() 
        });
      }

      const profile = await storage.createCelebrityProfile({
        ...validation.data,
        userId,
      });

      res.json({ profile, message: "Celebrity profile created successfully" });
    } catch (error) {
      console.error("Error creating celebrity profile:", error);
      res.status(500).json({ message: "Failed to create celebrity profile" });
    }
  });

  // POST /api/celebrities/:id/follow - Follow celebrity
  app.post("/api/celebrities/:id/follow", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const celebrityId = req.params.id;
      
      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      const isFollowing = await storage.isFollowing(userId, celebrityId);
      if (isFollowing) {
        return res.status(400).json({ message: "Already following this celebrity" });
      }

      await storage.createFollow({
        fanId: userId,
        celebrityId,
        notificationsEnabled: true,
      });

      const newCount = celebrity.followerCount + 1;
      await storage.updateCelebrityFollowerCount(celebrityId, newCount);

      res.json({ message: "Followed successfully", isFollowing: true, followerCount: newCount });
    } catch (error: any) {
      console.error("Error following celebrity:", error);
      res.status(500).json({ message: error.message || "Failed to follow celebrity" });
    }
  });

  // DELETE /api/celebrities/:id/follow - Unfollow celebrity
  app.delete("/api/celebrities/:id/follow", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const celebrityId = req.params.id;
      
      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      const success = await storage.deleteFollow(userId, celebrityId);
      if (!success) {
        return res.status(400).json({ message: "Not following this celebrity" });
      }

      const newCount = celebrity.followerCount - 1;
      await storage.updateCelebrityFollowerCount(celebrityId, Math.max(0, newCount));

      res.json({ message: "Unfollowed successfully", isFollowing: false, followerCount: newCount });
    } catch (error: any) {
      console.error("Error unfollowing celebrity:", error);
      res.status(500).json({ message: error.message || "Failed to unfollow celebrity" });
    }
  });

  // POST /api/celebrities/:id/stake - Stake tokens
  app.post("/api/celebrities/:id/stake", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const celebrityId = req.params.id;
      
      const validation = insertFanStakeSchema.omit({ fanId: true, celebrityId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid stake data", 
          error: fromError(validation.error).toString() 
        });
      }

      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      const stake = await storage.createStake({
        ...validation.data,
        fanId: userId,
        celebrityId,
      });

      // Update celebrity total staked
      const currentStaked = parseFloat(celebrity.totalStaked || "0");
      const newStaked = currentStaked + parseFloat(validation.data.amountStaked);
      await storage.updateCelebrityTotalStaked(celebrityId, newStaked.toString());

      res.json({ stake, message: "Stake placed successfully" });
    } catch (error) {
      console.error("Error staking on celebrity:", error);
      res.status(500).json({ message: "Failed to place stake" });
    }
  });

  // POST /api/celebrities/:id/content - Post content (celebrities only)
  app.post("/api/celebrities/:id/content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const celebrityId = req.params.id;
      
      // Check if user is the celebrity
      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      if (celebrity.userId !== userId) {
        return res.status(403).json({ message: "Only the celebrity can post content" });
      }

      const validation = insertCelebrityContentSchema.omit({ celebrityId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid content data", 
          error: fromError(validation.error).toString() 
        });
      }

      const content = await storage.createCelebrityContent({
        ...validation.data,
        celebrityId,
      });

      res.json({ content, message: "Content posted successfully" });
    } catch (error) {
      console.error("Error posting content:", error);
      res.status(500).json({ message: "Failed to post content" });
    }
  });

  // GET /api/celebrities/:id/content - Get celebrity content
  app.get("/api/celebrities/:id/content", isAuthenticated, async (req: any, res) => {
    try {
      const celebrityId = req.params.id;
      const userId = req.user.claims.sub;
      
      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      let content = await storage.getCelebrityContent(celebrityId);
      
      // Filter based on access level
      const isFollowing = await storage.isFollowing(userId, celebrityId);
      const userStakes = await storage.getUserStakes(userId);
      const hasStake = userStakes.some(s => s.celebrityId === celebrityId && s.status === "active");
      
      content = content.filter(item => {
        if (item.accessLevel === "public") return true;
        if (item.accessLevel === "followers" && isFollowing) return true;
        if (item.accessLevel === "stakers" && hasStake) return true;
        if (item.accessLevel === "premium" && hasStake) return true;
        return false;
      });

      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // POST /api/celebrities/:id/predictions - Create prediction
  app.post("/api/celebrities/:id/predictions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const celebrityId = req.params.id;
      const user = await storage.getUser(userId);
      
      // Check if user is admin or the celebrity
      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      const isAdminOrCelebrity = user?.isAdmin || celebrity.userId === userId;
      if (!isAdminOrCelebrity) {
        return res.status(403).json({ message: "Only admins and the celebrity can create predictions" });
      }

      const validation = insertPredictionMarketSchema.omit({ celebrityId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid prediction data", 
          error: fromError(validation.error).toString() 
        });
      }

      const prediction = await storage.createPredictionMarket({
        ...validation.data,
        celebrityId,
      });

      res.json({ prediction, message: "Prediction created successfully" });
    } catch (error) {
      console.error("Error creating prediction:", error);
      res.status(500).json({ message: "Failed to create prediction" });
    }
  });

  // POST /api/celebrities/:id/predictions/:predId/bet - Place bet
  app.post("/api/celebrities/:id/predictions/:predId/bet", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: celebrityId, predId } = req.params;
      
      // Verify prediction exists
      const prediction = await storage.getPredictionMarket(predId);
      if (!prediction) {
        return res.status(404).json({ message: "Prediction not found" });
      }

      if (prediction.status !== "open") {
        return res.status(400).json({ message: "Prediction is not open for betting" });
      }

      const validation = insertFanBetSchema.omit({ fanId: true, celebrityId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid bet data", 
          error: fromError(validation.error).toString() 
        });
      }

      const bet = await storage.createBet({
        ...validation.data,
        fanId: userId,
        celebrityId,
      });

      // Update prediction pool
      const currentPool = parseFloat(prediction.totalPool || "0");
      const newPool = currentPool + parseFloat(validation.data.amountBet);
      await storage.updatePredictionMarket(predId, {
        totalPool: newPool.toString(),
      });

      res.json({ bet, message: "Bet placed successfully" });
    } catch (error) {
      console.error("Error placing bet:", error);
      res.status(500).json({ message: "Failed to place bet" });
    }
  });

  // Legacy TWinn endpoints (for backward compatibility)
  // GET /api/twinn/celebrities - List all verified celebrities
  app.get("/api/twinn/celebrities", isAuthenticated, async (req: any, res) => {
    try {
      const { status = "verified" } = req.query;
      const celebrities = await storage.getAllCelebrityProfiles(status);
      
      // Get follow status for current user
      const userId = req.user.claims.sub;
      const userFollows = await storage.getUserFollows(userId);
      const followedIds = new Set(userFollows.map(f => f.celebrityId));
      
      const celebritiesWithFollowStatus = celebrities.map(celeb => ({
        ...celeb,
        isFollowing: followedIds.has(celeb.id),
      }));
      
      res.json(celebritiesWithFollowStatus);
    } catch (error) {
      console.error("Error fetching celebrities:", error);
      res.status(500).json({ message: "Failed to fetch celebrities" });
    }
  });

  // POST /api/twinn/follow/:id - Follow/Unfollow celebrity
  app.post("/api/twinn/follow/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const celebrityId = req.params.id;
      
      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      const isFollowing = await storage.isFollowing(userId, celebrityId);
      
      if (isFollowing) {
        // Unfollow
        await storage.deleteFollow(userId, celebrityId);
        const newCount = celebrity.followerCount - 1;
        await storage.updateCelebrityFollowerCount(celebrityId, Math.max(0, newCount));
        res.json({ message: "Unfollowed successfully", isFollowing: false, followerCount: newCount });
      } else {
        // Follow
        await storage.createFollow({
          fanId: userId,
          celebrityId,
          notificationsEnabled: true,
        });
        const newCount = celebrity.followerCount + 1;
        await storage.updateCelebrityFollowerCount(celebrityId, newCount);
        res.json({ message: "Followed successfully", isFollowing: true, followerCount: newCount });
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      res.status(500).json({ message: error.message || "Failed to toggle follow" });
    }
  });

  // POST /api/twinn/stake/:id - Stake tokens on celebrity
  app.post("/api/twinn/stake/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const celebrityId = req.params.id;
      
      const validation = insertFanStakeSchema.omit({ fanId: true, celebrityId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid stake data", 
          error: fromError(validation.error).toString() 
        });
      }

      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      const stake = await storage.createStake({
        ...validation.data,
        fanId: userId,
        celebrityId,
      });

      // Update celebrity total staked
      const currentStaked = parseFloat(celebrity.totalStaked || "0");
      const newStaked = currentStaked + parseFloat(validation.data.amountStaked);
      await storage.updateCelebrityTotalStaked(celebrityId, newStaked.toString());

      res.json({ stake, message: "Stake placed successfully" });
    } catch (error) {
      console.error("Error staking on celebrity:", error);
      res.status(500).json({ message: "Failed to place stake" });
    }
  });

  // POST /api/twinn/bets - Place bet on prediction
  app.post("/api/twinn/bets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validation = insertFanBetSchema.omit({ fanId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid bet data", 
          error: fromError(validation.error).toString() 
        });
      }

      if (validation.data.celebrityId) {
        const celebrity = await storage.getCelebrityProfile(validation.data.celebrityId);
        if (!celebrity) {
          return res.status(404).json({ message: "Celebrity not found" });
        }
      }

      const bet = await storage.createBet({
        ...validation.data,
        fanId: userId,
      });

      res.json({ bet, message: "Bet placed successfully" });
    } catch (error) {
      console.error("Error placing bet:", error);
      res.status(500).json({ message: "Failed to place bet" });
    }
  });

  // GET /api/twinn/content/:id - Get celebrity content
  app.get("/api/twinn/content/:id", isAuthenticated, async (req: any, res) => {
    try {
      const celebrityId = req.params.id;
      const userId = req.user.claims.sub;
      
      const celebrity = await storage.getCelebrityProfile(celebrityId);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }

      let content = await storage.getCelebrityContent(celebrityId);
      
      // Filter based on access level
      const isFollowing = await storage.isFollowing(userId, celebrityId);
      const userStakes = await storage.getUserStakes(userId);
      const hasStake = userStakes.some(s => s.celebrityId === celebrityId && s.status === "active");
      
      content = content.filter(item => {
        if (item.accessLevel === "public") return true;
        if (item.accessLevel === "followers" && isFollowing) return true;
        if (item.accessLevel === "stakers" && hasStake) return true;
        if (item.accessLevel === "premium" && hasStake) return true;
        return false;
      });

      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // POST /api/twinn/predictions - Create prediction (admin/celebrity only)
  app.post("/api/twinn/predictions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is admin or celebrity
      const celebrityProfile = await storage.getCelebrityProfileByUserId(userId);
      const isAdminOrCelebrity = user?.isAdmin || (celebrityProfile?.verificationStatus === "verified");
      
      if (!isAdminOrCelebrity) {
        return res.status(403).json({ message: "Only admins and verified celebrities can create predictions" });
      }

      const validation = insertPredictionMarketSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid prediction data", 
          error: fromError(validation.error).toString() 
        });
      }

      const prediction = await storage.createPredictionMarket(validation.data);
      res.json({ prediction, message: "Prediction created successfully" });
    } catch (error) {
      console.error("Error creating prediction:", error);
      res.status(500).json({ message: "Failed to create prediction" });
    }
  });

  // GET /api/twinn/predictions - Get prediction markets
  app.get("/api/twinn/predictions", isAuthenticated, async (req: any, res) => {
    try {
      const { celebrityId } = req.query;
      const predictions = await storage.getPredictionMarkets(celebrityId as string);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  // GET /api/twinn/my-follows - Get user's follows
  app.get("/api/twinn/my-follows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const follows = await storage.getUserFollows(userId);
      res.json(follows);
    } catch (error) {
      console.error("Error fetching follows:", error);
      res.status(500).json({ message: "Failed to fetch follows" });
    }
  });

  // GET /api/twinn/my-stakes - Get user's stakes
  app.get("/api/twinn/my-stakes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stakes = await storage.getUserStakes(userId);
      res.json(stakes);
    } catch (error) {
      console.error("Error fetching stakes:", error);
      res.status(500).json({ message: "Failed to fetch stakes" });
    }
  });

  // GET /api/twinn/my-bets - Get user's bets
  app.get("/api/twinn/my-bets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bets = await storage.getUserBets(userId);
      res.json(bets);
    } catch (error) {
      console.error("Error fetching bets:", error);
      res.status(500).json({ message: "Failed to fetch bets" });
    }
  });

  // POST /api/twinn/content/view/:id - Increment content view count
  app.post("/api/twinn/content/view/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.updateContentViews(req.params.id);
      res.json({ message: "View recorded" });
    } catch (error) {
      console.error("Error recording view:", error);
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  // POST /api/twinn/content/like/:id - Increment content like count
  app.post("/api/twinn/content/like/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.updateContentLikes(req.params.id);
      res.json({ message: "Like recorded" });
    } catch (error) {
      console.error("Error recording like:", error);
      res.status(500).json({ message: "Failed to record like" });
    }
  });

  // Spectrum Investment Plans routes
  // GET /api/spectrum/plans - Get all spectrum plans
  app.get("/api/spectrum/plans", isAuthenticated, async (req: any, res) => {
    try {
      const plans = await storage.getAllSpectrumPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching spectrum plans:", error);
      res.status(500).json({ message: "Failed to fetch spectrum plans" });
    }
  });

  // GET /api/spectrum/positions - Get user's spectrum subscriptions
  app.get("/api/spectrum/positions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserSpectrumSubscription(userId);
      
      if (!subscription) {
        return res.json(null);
      }

      // Calculate accrued rewards
      const lastUpdate = new Date(subscription.lastEarningsUpdate || subscription.subscribedAt);
      const now = new Date();
      const timeDiffMs = now.getTime() - lastUpdate.getTime();
      const daysPassed = timeDiffMs / (1000 * 60 * 60 * 24);
      const yearsPassed = daysPassed / 365;
      
      const stakedAmount = parseFloat(subscription.stakedAmount);
      const apy = parseFloat(subscription.currentApy) / 100;
      const accruedRewards = stakedAmount * apy * yearsPassed;
      const totalEarned = parseFloat(subscription.totalEarned || "0");

      res.json({
        ...subscription,
        accruedRewards: accruedRewards.toFixed(2),
        totalValue: (stakedAmount + totalEarned + accruedRewards).toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching spectrum positions:", error);
      res.status(500).json({ message: "Failed to fetch positions" });
    }
  });

  // POST /api/spectrum/stake - Create new spectrum subscription
  app.post("/api/spectrum/stake", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId, amount, paymentMethod } = req.body;

      // Check KYC status
      const user = await storage.getUser(userId);
      if (!user || user.kycStatus !== "approved") {
        return res.status(403).json({ 
          message: "KYC verification required. Please complete KYC verification before staking.",
          kycStatus: user?.kycStatus || "pending"
        });
      }

      // Check if user already has active subscription
      const existing = await storage.getUserSpectrumSubscription(userId);
      if (existing && existing.status === "active") {
        return res.status(400).json({ message: "You already have an active subscription. Upgrade instead." });
      }

      // Get plan details
      const plan = await storage.getSpectrumPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Validate minimum stake
      const stakeAmount = parseFloat(amount);
      const minStake = parseFloat(plan.minimumStake);
      if (stakeAmount < minStake) {
        return res.status(400).json({ 
          message: `Minimum stake for ${plan.name} is $${minStake.toLocaleString()}` 
        });
      }

      // Process payment (integrate with existing payment systems)
      let paymentProcessed = false;
      if (paymentMethod === "stripe") {
        // Process Stripe payment (would integrate with actual Stripe API)
        paymentProcessed = true;
      } else if (paymentMethod === "crypto") {
        // Process crypto payment
        paymentProcessed = true;
      } else {
        return res.status(400).json({ message: "Invalid payment method" });
      }

      if (!paymentProcessed) {
        return res.status(500).json({ message: "Payment processing failed" });
      }

      // Create subscription
      const subscription = await storage.createSpectrumSubscription({
        userId,
        planId: plan.id,
        tier: plan.tier,
        stakedAmount: amount,
        currentApy: plan.apy,
        status: "active",
      });

      res.json({ subscription, message: "Successfully staked in Spectrum plan!" });
    } catch (error) {
      console.error("Error creating spectrum stake:", error);
      res.status(500).json({ message: "Failed to stake" });
    }
  });

  // POST /api/spectrum/claim - Claim accrued rewards
  app.post("/api/spectrum/claim", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const subscription = await storage.getUserSpectrumSubscription(userId);
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      // Calculate accrued rewards
      const lastUpdate = new Date(subscription.lastEarningsUpdate || subscription.subscribedAt);
      const now = new Date();
      const timeDiffMs = now.getTime() - lastUpdate.getTime();
      const daysPassed = timeDiffMs / (1000 * 60 * 60 * 24);
      const yearsPassed = daysPassed / 365;
      
      const stakedAmount = parseFloat(subscription.stakedAmount);
      const apy = parseFloat(subscription.currentApy) / 100;
      const accruedRewards = stakedAmount * apy * yearsPassed;

      if (accruedRewards <= 0) {
        return res.status(400).json({ message: "No rewards to claim" });
      }

      // Record earnings
      await storage.createSpectrumEarning({
        subscriptionId: subscription.id,
        userId,
        amount: accruedRewards.toFixed(18),
        apy: subscription.currentApy,
        periodStart: lastUpdate,
        periodEnd: now,
      });

      // Update subscription total earned and last update
      const newTotalEarned = parseFloat(subscription.totalEarned || "0") + accruedRewards;
      await storage.updateSpectrumSubscription(subscription.id, {
        totalEarned: newTotalEarned.toFixed(18),
        lastEarningsUpdate: now,
      });

      res.json({ 
        claimed: accruedRewards.toFixed(2),
        totalEarned: newTotalEarned.toFixed(2),
        message: "Rewards claimed successfully!" 
      });
    } catch (error) {
      console.error("Error claiming rewards:", error);
      res.status(500).json({ message: "Failed to claim rewards" });
    }
  });

  // POST /api/spectrum/upgrade - Upgrade to higher tier
  app.post("/api/spectrum/upgrade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId, additionalAmount, paymentMethod } = req.body;

      // Get current subscription
      const currentSub = await storage.getUserSpectrumSubscription(userId);
      if (!currentSub) {
        return res.status(404).json({ message: "No active subscription to upgrade" });
      }

      // Get new plan
      const newPlan = await storage.getSpectrumPlan(planId);
      if (!newPlan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Calculate new total stake
      const currentStake = parseFloat(currentSub.stakedAmount);
      const additional = parseFloat(additionalAmount || "0");
      const newTotalStake = currentStake + additional;

      // Validate minimum stake for new tier
      const minStake = parseFloat(newPlan.minimumStake);
      if (newTotalStake < minStake) {
        return res.status(400).json({ 
          message: `Need $${(minStake - currentStake).toLocaleString()} more to upgrade to ${newPlan.name}` 
        });
      }

      // Process additional payment if needed
      if (additional > 0) {
        let paymentProcessed = false;
        if (paymentMethod === "stripe") {
          paymentProcessed = true;
        } else if (paymentMethod === "crypto") {
          paymentProcessed = true;
        }

        if (!paymentProcessed) {
          return res.status(500).json({ message: "Payment processing failed" });
        }
      }

      // Update subscription to new tier
      await storage.updateSpectrumSubscription(currentSub.id, {
        planId: newPlan.id,
        tier: newPlan.tier,
        stakedAmount: newTotalStake.toFixed(18),
        currentApy: newPlan.apy,
      });

      res.json({ message: `Successfully upgraded to ${newPlan.name}!` });
    } catch (error) {
      console.error("Error upgrading spectrum tier:", error);
      res.status(500).json({ message: "Failed to upgrade tier" });
    }
  });

  // GET /api/spectrum/earnings - Get earnings history
  app.get("/api/spectrum/earnings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const earnings = await storage.getSpectrumEarnings(userId);
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  // GET /api/spectrum/stakes/:userId - User stakes (alias for positions)
  app.get("/api/spectrum/stakes/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = req.user.claims.sub;
      const targetUserId = req.params.userId;
      
      // Verify user can only access their own stakes
      if (requestingUserId !== targetUserId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const subscription = await storage.getUserSpectrumSubscription(targetUserId);
      
      if (!subscription) {
        return res.json(null);
      }

      // Get the plan details
      const plan = await storage.getSpectrumPlan(subscription.planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Calculate accrued rewards
      const stakedAmount = parseFloat(subscription.stakedAmount);
      const apy = parseFloat(subscription.currentApy) / 100;
      const lastUpdate = subscription.lastEarningsUpdate || subscription.subscribedAt;
      const now = new Date();
      const daysPassed = (now.getTime() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
      const dailyRate = apy / 365;
      const accruedRewards = stakedAmount * dailyRate * daysPassed;

      res.json({
        ...subscription,
        planName: plan.name,
        accruedRewards: accruedRewards.toFixed(18),
        totalValue: (stakedAmount + accruedRewards).toFixed(18),
      });
    } catch (error) {
      console.error("Error fetching spectrum stakes:", error);
      res.status(500).json({ message: "Failed to fetch stakes" });
    }
  });

  // POST /api/spectrum/withdraw - Withdraw stake (alias for claim)
  app.post("/api/spectrum/withdraw", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, withdrawAll = false } = req.body;
      
      const subscription = await storage.getUserSpectrumSubscription(userId);
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      // Calculate accrued rewards
      const stakedAmount = parseFloat(subscription.stakedAmount);
      const apy = parseFloat(subscription.currentApy) / 100;
      const lastUpdate = subscription.lastEarningsUpdate || subscription.subscribedAt;
      const now = new Date();
      const daysPassed = (now.getTime() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
      const dailyRate = apy / 365;
      const accruedRewards = stakedAmount * dailyRate * daysPassed;

      if (withdrawAll) {
        // Withdraw entire stake and rewards
        const totalAmount = stakedAmount + accruedRewards;
        
        // Create earning record
        await storage.createSpectrumEarning({
          subscriptionId: subscription.id,
          userId,
          amount: accruedRewards.toFixed(18),
          apy: subscription.currentApy,
          periodStart: new Date(lastUpdate),
          periodEnd: now,
        });

        // Cancel subscription
        await storage.cancelSpectrumSubscription(subscription.id);

        res.json({
          message: "Successfully withdrawn all funds",
          amount: totalAmount.toFixed(2),
          principal: stakedAmount.toFixed(2),
          rewards: accruedRewards.toFixed(2),
        });
      } else {
        // Withdraw only rewards
        if (accruedRewards <= 0) {
          return res.status(400).json({ message: "No rewards available to withdraw" });
        }

        // Create earning record
        await storage.createSpectrumEarning({
          subscriptionId: subscription.id,
          userId,
          amount: accruedRewards.toFixed(18),
          apy: subscription.currentApy,
          periodStart: new Date(lastUpdate),
          periodEnd: now,
        });

        // Update subscription
        const newTotalEarned = parseFloat(subscription.totalEarned || "0") + accruedRewards;
        await storage.updateSpectrumSubscription(subscription.id, {
          totalEarned: newTotalEarned.toFixed(18),
          lastEarningsUpdate: now,
        });

        res.json({
          message: "Successfully withdrawn rewards",
          amount: accruedRewards.toFixed(2),
        });
      }
    } catch (error) {
      console.error("Error withdrawing from spectrum:", error);
      res.status(500).json({ message: "Failed to withdraw" });
    }
  });

  // ============================================
  // INDIVIDUAL ASSETS & ETHEREAL ELEMENTS
  // ============================================

  // GET /api/assets/ethereal - List all ethereal elements
  app.get("/api/assets/ethereal", isAuthenticated, async (req: any, res) => {
    try {
      const elements = await storage.getAllEtherealElements();
      res.json(elements);
    } catch (error) {
      console.error("Error fetching ethereal elements:", error);
      res.status(500).json({ message: "Failed to fetch ethereal elements" });
    }
  });

  // POST /api/assets/ethereal/mint - Mint new ethereal element (admin only)
  app.post("/api/assets/ethereal/mint", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validation = insertEtherealElementSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid element data", 
          error: fromError(validation.error).toString() 
        });
      }

      const element = await storage.createEtherealElement(validation.data);
      res.json(element);
    } catch (error) {
      console.error("Error minting ethereal element:", error);
      res.status(500).json({ message: "Failed to mint ethereal element" });
    }
  });

  // POST /api/assets/ethereal/buy - Purchase ethereal element
  app.post("/api/assets/ethereal/buy", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { elementId, quantity = 1, price } = req.body;

      // Verify element exists
      const element = await storage.getEtherealElement(elementId);
      if (!element) {
        return res.status(404).json({ message: "Ethereal element not found" });
      }

      // Check supply limits
      if (element.totalSupply && (element.mintedCount || 0) + quantity > element.totalSupply) {
        return res.status(400).json({ message: "Not enough supply available" });
      }

      // Check if user already owns this element
      const existingOwnership = await storage.getEtherealOwnership(userId, elementId);

      if (existingOwnership) {
        // Update quantity
        await storage.updateEtherealOwnershipQuantity(
          userId, 
          elementId, 
          existingOwnership.quantity + quantity
        );
      } else {
        // Create new ownership
        await storage.createEtherealOwnership({
          userId,
          elementId,
          quantity,
        });
      }

      // Update element mint count
      await storage.updateEtherealElementMintCount(elementId, (element.mintedCount || 0) + quantity);

      // Create individual asset record
      await storage.createIndividualAsset({
        userId,
        name: element.name,
        assetType: "ethereal",
        marketValue: price || "0",
        purchasePrice: price || "0",
        quantity: quantity.toString(),
        metadata: {
          elementId,
          elementType: element.elementType,
          rarity: element.rarity,
          power: element.power,
        },
        imageUrl: element.imageUrl,
      });

      res.json({ message: "Ethereal element purchased successfully" });
    } catch (error) {
      console.error("Error purchasing ethereal element:", error);
      res.status(500).json({ message: "Failed to purchase ethereal element" });
    }
  });

  // GET /api/ethereal/marketplace - Get marketplace with pricing info
  app.get("/api/ethereal/marketplace", isAuthenticated, async (req: any, res) => {
    try {
      const marketplace = await etherealService.getElementMarketplace();
      res.json(marketplace);
    } catch (error) {
      console.error("Error fetching ethereal marketplace:", error);
      res.status(500).json({ message: "Failed to fetch marketplace" });
    }
  });

  // GET /api/ethereal/collection - Get user's collection
  app.get("/api/ethereal/collection", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const collection = await etherealService.getUserCollection(userId);
      res.json(collection);
    } catch (error) {
      console.error("Error fetching user collection:", error);
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // GET /api/ethereal/:id/details - Get element details
  app.get("/api/ethereal/:id/details", isAuthenticated, async (req: any, res) => {
    try {
      const details = await etherealService.getElementDetails(req.params.id);
      res.json(details);
    } catch (error: any) {
      console.error("Error fetching element details:", error);
      res.status(404).json({ message: error.message || "Element not found" });
    }
  });

  // POST /api/ethereal/transfer - Transfer element to another user
  app.post("/api/ethereal/transfer", isAuthenticated, async (req: any, res) => {
    try {
      const fromUserId = req.user.claims.sub;
      const { toUserId, elementId, quantity = 1 } = req.body;

      if (!toUserId || !elementId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await etherealService.transferElement(
        fromUserId,
        toUserId,
        elementId,
        quantity
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error transferring element:", error);
      res.status(500).json({ message: error.message || "Transfer failed" });
    }
  });

  // GET /api/ethereal/filter/rarity/:rarity - Get elements by rarity
  app.get("/api/ethereal/filter/rarity/:rarity", isAuthenticated, async (req: any, res) => {
    try {
      const elements = await etherealService.getElementsByRarity(req.params.rarity);
      res.json(elements);
    } catch (error) {
      console.error("Error filtering by rarity:", error);
      res.status(500).json({ message: "Failed to filter elements" });
    }
  });

  // GET /api/ethereal/filter/type/:type - Get elements by type
  app.get("/api/ethereal/filter/type/:type", isAuthenticated, async (req: any, res) => {
    try {
      const elements = await etherealService.getElementsByType(req.params.type);
      res.json(elements);
    } catch (error) {
      console.error("Error filtering by type:", error);
      res.status(500).json({ message: "Failed to filter elements" });
    }
  });

  // GET /api/ethereal/top - Get top elements by power
  app.get("/api/ethereal/top", isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topElements = await etherealService.getTopElements(limit);
      res.json(topElements);
    } catch (error) {
      console.error("Error fetching top elements:", error);
      res.status(500).json({ message: "Failed to fetch top elements" });
    }
  });

  // POST /api/ethereal/purchase - Purchase using etherealService
  app.post("/api/ethereal/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { elementId, quantity = 1 } = req.body;

      const result = await etherealService.purchaseElement(userId, elementId, quantity);
      res.json(result);
    } catch (error: any) {
      console.error("Error purchasing element:", error);
      res.status(500).json({ message: error.message || "Purchase failed" });
    }
  });

  // GET /api/assets/metals - List precious metal offerings with live prices
  app.get("/api/assets/metals", isAuthenticated, async (req: any, res) => {
    try {
      // Fetch live metal prices
      const [gold, silver] = await Promise.all([
        marketDataService.getMetalPrice("gold"),
        marketDataService.getMetalPrice("silver"),
      ]);

      // Create metal offerings
      const metalOfferings = [
        {
          id: "gold-1oz",
          name: "Gold Coin (1 oz)",
          symbol: "GOLD",
          weight: "1 oz",
          purity: "99.99%",
          price: gold.price,
          change: gold.change,
          changePercent: gold.changePercent,
          imageUrl: "https://via.placeholder.com/200x200?text=Gold+Coin",
        },
        {
          id: "silver-1oz",
          name: "Silver Coin (1 oz)",
          symbol: "SILVER",
          weight: "1 oz",
          purity: "99.9%",
          price: silver.price,
          change: silver.change,
          changePercent: silver.changePercent,
          imageUrl: "https://via.placeholder.com/200x200?text=Silver+Coin",
        },
      ];

      res.json(metalOfferings);
    } catch (error) {
      console.error("Error fetching metal prices:", error);
      res.status(500).json({ message: "Failed to fetch metal prices" });
    }
  });

  // POST /api/assets/metals/buy - Buy gold/silver coins
  app.post("/api/assets/metals/buy", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { metalId, quantity, paymentMethod } = req.body;

      // Determine metal type and fetch current price
      const isgold = metalId.includes("gold");
      const metal = isgold ? "gold" : "silver";
      const metalData = await marketDataService.getMetalPrice(metal);

      const totalPrice = metalData.price * quantity;

      // Process payment (simplified for now)
      let paymentProcessed = false;
      if (paymentMethod === "stripe") {
        paymentProcessed = true;
      } else if (paymentMethod === "crypto") {
        paymentProcessed = true;
      }

      if (!paymentProcessed) {
        return res.status(500).json({ message: "Payment processing failed" });
      }

      // Create individual asset record
      const asset = await storage.createIndividualAsset({
        userId,
        name: `${metal.charAt(0).toUpperCase() + metal.slice(1)} Coin (${quantity} oz)`,
        assetType: "precious_metal",
        marketValue: totalPrice.toFixed(2),
        purchasePrice: totalPrice.toFixed(2),
        quantity: quantity.toString(),
        metadata: {
          metal,
          weight: `${quantity} oz`,
          purity: isgold ? "99.99%" : "99.9%",
          purchaseDate: new Date().toISOString(),
        },
        imageUrl: `https://via.placeholder.com/200x200?text=${metal}+Coin`,
        certificateUrl: `https://example.com/certificate/${asset?.id || 'placeholder'}`,
      });

      res.json({ 
        message: "Precious metal purchased successfully",
        asset,
      });
    } catch (error) {
      console.error("Error purchasing metal:", error);
      res.status(500).json({ message: "Failed to purchase precious metal" });
    }
  });

  // GET /api/assets/user - Get user's owned assets
  app.get("/api/assets/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Fetch all user assets
      const [individualAssets, etherealOwnerships] = await Promise.all([
        storage.getUserIndividualAssets(userId),
        storage.getUserEtherealOwnerships(userId),
      ]);

      // Update precious metal values with live prices
      const updatedAssets = await Promise.all(
        individualAssets.map(async (asset) => {
          if (asset.assetType === "precious_metal" && asset.metadata) {
            const metal = (asset.metadata as any).metal;
            if (metal) {
              try {
                const livePrice = await marketDataService.getMetalPrice(metal);
                const quantity = parseFloat(asset.quantity || "1");
                const currentValue = (livePrice.price * quantity).toFixed(2);
                
                // Update in database if value changed
                if (currentValue !== asset.marketValue) {
                  await storage.updateIndividualAssetValue(asset.id, currentValue);
                }

                return {
                  ...asset,
                  marketValue: currentValue,
                  livePrice: livePrice.price,
                  change: livePrice.change,
                  changePercent: livePrice.changePercent,
                };
              } catch (err) {
                console.error(`Error updating ${metal} price:`, err);
              }
            }
          }
          return asset;
        })
      );

      res.json({
        individualAssets: updatedAssets,
        etherealAssets: etherealOwnerships,
      });
    } catch (error) {
      console.error("Error fetching user assets:", error);
      res.status(500).json({ message: "Failed to fetch user assets" });
    }
  });

  // Prayer Integration System Routes
  // GET /api/prayers/daily-scripture - Get daily scripture
  app.get("/api/prayers/daily-scripture", isAuthenticated, async (req: any, res) => {
    try {
      const scripture = await prayerService.getDailyScripture();
      res.json(scripture);
    } catch (error) {
      console.error("Error fetching daily scripture:", error);
      res.status(500).json({ message: "Failed to fetch daily scripture" });
    }
  });

  // GET /api/prayers/random-scripture - Get random scripture by category
  app.get("/api/prayers/random-scripture", isAuthenticated, async (req: any, res) => {
    try {
      const { category } = req.query;
      const scripture = await prayerService.getRandomScripture(category as string);
      res.json(scripture);
    } catch (error) {
      console.error("Error fetching random scripture:", error);
      res.status(500).json({ message: "Failed to fetch scripture" });
    }
  });

  // POST /api/prayers - Log a new prayer
  app.post("/api/prayers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertPrayerSchema.parse({ ...req.body, userId });
      const prayer = await prayerService.logPrayer(userId, parsed.prayerText, parsed.category);
      res.json(prayer);
    } catch (error) {
      console.error("Error logging prayer:", error);
      res.status(400).json({ message: fromError(error).toString() });
    }
  });

  // GET /api/prayers - Get user's prayers
  app.get("/api/prayers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit } = req.query;
      const prayers = await prayerService.getUserPrayers(userId, limit ? parseInt(limit as string) : undefined);
      res.json(prayers);
    } catch (error) {
      console.error("Error fetching prayers:", error);
      res.status(500).json({ message: "Failed to fetch prayers" });
    }
  });

  // GET /api/prayers/history - Get prayer history with trade correlations
  app.get("/api/prayers/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await prayerService.getPrayerHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching prayer history:", error);
      res.status(500).json({ message: "Failed to fetch prayer history" });
    }
  });

  // GET /api/prayers/insights - Get prayer insights and statistics
  app.get("/api/prayers/insights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await prayerService.getPrayerInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching prayer insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  // POST /api/prayers/correlate - Correlate prayer with trade
  app.post("/api/prayers/correlate", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertPrayerTradeCorrelationSchema.parse(req.body);
      const correlation = await prayerService.correlatePrayerWithTrade(
        parsed.prayerId,
        parsed.tradeId,
        parsed.botExecutionId,
        parsed.outcome,
        parsed.profitLoss
      );
      res.json(correlation);
    } catch (error) {
      console.error("Error correlating prayer with trade:", error);
      res.status(400).json({ message: fromError(error).toString() });
    }
  });

  // POST /api/prayers/seed-scriptures - Seed scripture database (admin or first time)
  app.post("/api/prayers/seed-scriptures", isAuthenticated, async (req: any, res) => {
    try {
      await prayerService.seedScriptures();
      res.json({ message: "Scriptures seeded successfully" });
    } catch (error) {
      console.error("Error seeding scriptures:", error);
      res.status(500).json({ message: "Failed to seed scriptures" });
    }
  });

  // Prayer Settings Routes
  // GET /api/prayers/settings - Get user's prayer settings
  app.get("/api/prayers/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let settings = await storage.getUserPrayerSettings(userId);
      
      // Create default settings if none exist
      if (!settings) {
        settings = await storage.upsertUserPrayerSettings({
          userId,
          enablePreTrade: true,
          enablePostTrade: true,
          preferredTime: "anytime",
          categories: ["trade_guidance", "wisdom", "prosperity"],
          dailyReminder: false,
          meditationDuration: 5,
          autoCorrelate: true,
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching prayer settings:", error);
      res.status(500).json({ message: "Failed to fetch prayer settings" });
    }
  });

  // PUT /api/prayers/settings - Update user's prayer settings
  app.put("/api/prayers/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.updateUserPrayerSettings(userId, req.body);
      const updatedSettings = await storage.getUserPrayerSettings(userId);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating prayer settings:", error);
      res.status(400).json({ message: "Failed to update prayer settings" });
    }
  });

  // Auto-Tithing System Routes
  // GET /api/tithing/charities - Get all active charities
  app.get("/api/tithing/charities", isAuthenticated, async (req: any, res) => {
    try {
      const charities = await storage.getActiveCharities();
      res.json(charities);
    } catch (error) {
      console.error("Error fetching charities:", error);
      res.status(500).json({ message: "Failed to fetch charities" });
    }
  });

  // GET /api/tithing/config - Get user's tithing configuration
  app.get("/api/tithing/config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const config = await storage.getTithingConfigByUserId(userId);
      res.json(config || null);
    } catch (error) {
      console.error("Error fetching tithing config:", error);
      res.status(500).json({ message: "Failed to fetch tithing config" });
    }
  });

  // POST /api/tithing/config - Create or update tithing configuration
  app.post("/api/tithing/config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validation = insertTithingConfigSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid config data", 
          error: fromError(validation.error).toString() 
        });
      }

      const existingConfig = await storage.getTithingConfigByUserId(userId);
      
      if (existingConfig) {
        await storage.updateTithingConfig(existingConfig.id, validation.data);
        const updated = await storage.getTithingConfigByUserId(userId);
        res.json(updated);
      } else {
        const config = await storage.createTithingConfig({
          ...validation.data,
          userId,
        });
        res.json(config);
      }
    } catch (error) {
      console.error("Error saving tithing config:", error);
      res.status(500).json({ message: "Failed to save tithing config" });
    }
  });

  // GET /api/tithing/history - Get tithing history
  app.get("/api/tithing/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { year, status } = req.query;
      
      let filters: any = {};
      if (year) {
        const yearNum = parseInt(year as string);
        filters.startDate = new Date(yearNum, 0, 1);
        filters.endDate = new Date(yearNum, 11, 31, 23, 59, 59);
      }
      if (status) {
        filters.status = status;
      }

      const history = await storage.getTithingHistory(userId, filters);
      res.json(history);
    } catch (error) {
      console.error("Error fetching tithing history:", error);
      res.status(500).json({ message: "Failed to fetch tithing history" });
    }
  });

  // POST /api/tithing/execute - Manually execute a tithe
  app.post("/api/tithing/execute", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, charityId, notes } = req.body;

      if (!amount || !charityId) {
        return res.status(400).json({ message: "Amount and charityId are required" });
      }

      const result = await tithingService.executeTithe(userId, amount, charityId, undefined, notes);
      res.json(result);
    } catch (error: any) {
      console.error("Error executing tithe:", error);
      res.status(500).json({ message: error.message || "Failed to execute tithe" });
    }
  });

  // GET /api/tithing/tax-report/:year - Get tax deduction report
  app.get("/api/tithing/tax-report/:year", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = parseInt(req.params.year);
      
      const report = await tithingService.getTaxReport(userId, year);
      res.json(report);
    } catch (error) {
      console.error("Error generating tax report:", error);
      res.status(500).json({ message: "Failed to generate tax report" });
    }
  });

  // GET /api/tithing/impact - Get giving impact dashboard
  app.get("/api/tithing/impact", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const impact = await tithingService.getImpactDashboard(userId);
      res.json(impact);
    } catch (error) {
      console.error("Error fetching impact dashboard:", error);
      res.status(500).json({ message: "Failed to fetch impact data" });
    }
  });

  // GET /api/tithing/statement/:year - Generate annual giving statement
  app.get("/api/tithing/statement/:year", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = parseInt(req.params.year);
      
      const statement = await tithingService.generateAnnualStatement(userId, year);
      res.setHeader('Content-Type', 'text/plain');
      res.send(statement);
    } catch (error) {
      console.error("Error generating statement:", error);
      res.status(500).json({ message: "Failed to generate statement" });
    }
  });

  // Admin charity management routes
  // GET /api/admin/charities - Get all charities (admin only)
  app.get("/api/admin/charities", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const charities = await storage.getAllCharities();
      res.json(charities);
    } catch (error) {
      console.error("Error fetching all charities:", error);
      res.status(500).json({ message: "Failed to fetch charities" });
    }
  });

  // POST /api/admin/charities - Create new charity (admin only)
  app.post("/api/admin/charities", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validation = insertCharitySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid charity data", 
          error: fromError(validation.error).toString() 
        });
      }

      const charity = await storage.createCharity(validation.data);
      res.json(charity);
    } catch (error) {
      console.error("Error creating charity:", error);
      res.status(500).json({ message: "Failed to create charity" });
    }
  });

  // PATCH /api/admin/charities/:id - Update charity (admin only)
  app.patch("/api/admin/charities/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.updateCharity(req.params.id, req.body);
      const updated = await storage.getCharity(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Error updating charity:", error);
      res.status(500).json({ message: "Failed to update charity" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  websocketService.initialize(httpServer);
  
  // Start broadcasting market data updates
  websocketService.startMarketDataBroadcast();
  
  // Seed scriptures on startup
  prayerService.seedScriptures().catch(console.error);
  
  return httpServer;
}
