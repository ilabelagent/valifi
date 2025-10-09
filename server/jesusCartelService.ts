import { web3Service } from "./web3Service";
import { storage } from "./storage";
import { encryptionService } from "./encryptionService";
import type { Song, Wallet } from "@shared/schema";

export interface PublishResult {
  song: Song;
  nft?: {
    id: string;
    contractAddress: string;
    tokenId: string;
    txHash: string;
  };
  token?: {
    id: string;
    contractAddress: string;
    symbol: string;
    txHash: string;
  };
}

/**
 * Jesus Cartel Publishing Service
 * Automates the complete pipeline: Song → NFT Minting → ERC-20 Token Deployment
 */
export class JesusCartelService {
  /**
   * Publish a song with automated NFT + Token creation
   */
  async publishSong(
    songId: string,
    walletId: string,
    options: {
      mintNFT?: boolean;
      createToken?: boolean;
      network?: string;
      tokenSupply?: string;
    } = {}
  ): Promise<PublishResult> {
    const {
      mintNFT = true,
      createToken = true,
      network = "polygon",
      tokenSupply = "1000000",
    } = options;

    // Get song details
    const song = await storage.getSong(songId);
    if (!song) {
      throw new Error("Song not found");
    }

    // Get wallet
    const wallet = await storage.getWallet(walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const result: PublishResult = { song };

    try {
      // Step 1: Deploy NFT if requested
      if (mintNFT) {
        const nftResult = await this.mintSongNFT(song, wallet, network);
        result.nft = nftResult;

        // Update song with NFT ID
        await storage.updateSongPublication(songId, nftResult.id);
      }

      // Step 2: Deploy ERC-20 Token if requested
      if (createToken) {
        const tokenResult = await this.createSongToken(song, wallet, network, tokenSupply);
        result.token = tokenResult;

        // Update song with Token ID
        await storage.updateSongPublication(songId, result.nft?.id, tokenResult.id);
      }

      // Mark song as published
      const updatedSong = await storage.getSong(songId);
      if (updatedSong) {
        result.song = updatedSong;
      }

      return result;
    } catch (error) {
      console.error("Publishing failed:", error);
      throw error;
    }
  }

  /**
   * Mint NFT for a song
   */
  private async mintSongNFT(
    song: Song,
    wallet: Wallet,
    network: string
  ): Promise<{
    id: string;
    contractAddress: string;
    tokenId: string;
    txHash: string;
  }> {
    // Decrypt private key securely
    const privateKey = encryptionService.decrypt(
      wallet.encryptedPrivateKey || "",
      wallet.userId
    );

    // Generate NFT collection name and symbol
    const collectionName = `${song.artist} - ${song.title}`;
    const collectionSymbol = this.generateSymbol(song.title);

    // Deploy NFT contract
    const deployment = await web3Service.deployERC721(
      collectionName,
      collectionSymbol,
      privateKey,
      network
    );

    // Mint the NFT
    const tokenId = 1; // First token in collection
    const tokenURI = song.albumArt || `ipfs://${song.audioFile}`;

    const mintResult = await web3Service.mintNFT(
      deployment.address,
      wallet.address,
      tokenId,
      tokenURI,
      privateKey,
      network
    );

    // Store NFT in database
    const nft = await storage.createNft({
      walletId: wallet.id,
      contractAddress: deployment.address,
      tokenId: tokenId.toString(),
      name: collectionName,
      description: `NFT for ${song.title} by ${song.artist}`,
      imageUrl: song.albumArt || "",
      metadata: {
        song: song.title,
        artist: song.artist,
        audioFile: song.audioFile,
      },
      network,
    });

    return {
      id: nft.id,
      contractAddress: deployment.address,
      tokenId: tokenId.toString(),
      txHash: mintResult.txHash,
    };
  }

  /**
   * Create ERC-20 token for a song
   */
  private async createSongToken(
    song: Song,
    wallet: Wallet,
    network: string,
    initialSupply: string
  ): Promise<{
    id: string;
    contractAddress: string;
    symbol: string;
    txHash: string;
  }> {
    // Decrypt private key securely
    const privateKey = encryptionService.decrypt(
      wallet.encryptedPrivateKey || "",
      wallet.userId
    );

    // Generate token details
    const tokenName = `${song.title} by ${song.artist}`;
    const tokenSymbol = this.generateSymbol(song.title);

    // Deploy ERC-20 token
    const deployment = await web3Service.deployERC20(
      tokenName,
      tokenSymbol,
      initialSupply,
      privateKey,
      network
    );

    // Store token in database
    const token = await storage.createToken({
      walletId: wallet.id,
      contractAddress: deployment.address,
      name: tokenName,
      symbol: tokenSymbol,
      balance: initialSupply,
      network,
      tokenType: "ERC20",
    });

    return {
      id: token.id,
      contractAddress: deployment.address,
      symbol: tokenSymbol,
      txHash: deployment.txHash,
    };
  }

  /**
   * Get latest music releases
   */
  async getLatestReleases(limit: number = 10) {
    return await storage.getLatestReleases(limit);
  }

  /**
   * Get featured releases
   */
  async getFeaturedReleases() {
    return await storage.getFeaturedReleases();
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10) {
    return await storage.getUpcomingEvents(limit);
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents() {
    return await storage.getFeaturedEvents();
  }

  /**
   * Track a stream/play of a release
   */
  async trackStreams(releaseId: string, userId?: string, duration?: number, completionRate?: number) {
    return await storage.trackStream({
      releaseId,
      userId,
      duration,
      completionRate: completionRate?.toString(),
    });
  }

  /**
   * Increment like count for a release
   */
  async likeRelease(releaseId: string) {
    await storage.incrementLikeCount(releaseId);
  }

  /**
   * Get a specific release
   */
  async getRelease(releaseId: string) {
    return await storage.getRelease(releaseId);
  }

  /**
   * Get a specific event
   */
  async getEvent(eventId: string) {
    return await storage.getEvent(eventId);
  }

  /**
   * Generate token symbol from song title
   * Example: "Blessed Be" → "BLESS", "Hallelujah" → "HALLE"
   */
  private generateSymbol(title: string): string {
    // Remove special characters and split into words
    const words = title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(" ")
      .filter((w) => w.length > 0);

    if (words.length === 1) {
      // Single word: take first 5 characters
      return words[0].substring(0, 5).toUpperCase();
    } else if (words.length === 2) {
      // Two words: take first 3 from first, first 2 from second
      return (words[0].substring(0, 3) + words[1].substring(0, 2)).toUpperCase();
    } else {
      // Multiple words: take first 2 letters from first 3 words
      return words
        .slice(0, 3)
        .map((w) => w.substring(0, 2))
        .join("")
        .toUpperCase();
    }
  }
}

export const jesusCartelService = new JesusCartelService();
