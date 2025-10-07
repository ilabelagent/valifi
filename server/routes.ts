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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

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

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  websocketService.initialize(httpServer);
  
  return httpServer;
}
