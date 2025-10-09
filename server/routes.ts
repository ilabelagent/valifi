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

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  websocketService.initialize(httpServer);
  
  return httpServer;
}
