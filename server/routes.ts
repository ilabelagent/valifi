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
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { web3Service } from "./web3Service";
import { jesusCartelService } from "./jesusCartelService";
import { agentOrchestrator } from "./agentOrchestrator";
import { websocketService } from "./websocketService";
import { encryptionService } from "./encryptionService";

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
        currency: currency || network.toUpperCase(),
        balance: "0",
        network,
        encryptedPrivateKey,
      });

      // SECURITY: Return mnemonic ONLY ONCE for user backup
      // Client must save this immediately - never stored or returned again
      res.json({
        id: wallet.id,
        address: wallet.address,
        currency: wallet.currency,
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
        wallet.encryptedPrivateKey || "",
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
        amount,
        toAddress: to,
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
        wallet.encryptedPrivateKey || "",
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
        balance: initialSupply,
        network,
        tokenType: "ERC20",
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
        wallet.encryptedPrivateKey || "",
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
        wallet.encryptedPrivateKey || "",
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
      const songs = await storage.getSongsByUserId(userId);
      res.json(songs);
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

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  websocketService.initialize(httpServer);
  
  return httpServer;
}
