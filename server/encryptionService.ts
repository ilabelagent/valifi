import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encryption Service for securing sensitive data (private keys, mnemonics)
 * Uses AES-256-GCM for authenticated encryption
 */
export class EncryptionService {
  private masterSecret: string;

  constructor() {
    // SECURITY: Require encryption master key - fail fast if missing
    this.masterSecret = process.env.ENCRYPTION_MASTER_KEY || process.env.SESSION_SECRET || "";
    
    if (!this.masterSecret || this.masterSecret.length < 32) {
      throw new Error(
        "CRITICAL SECURITY ERROR: ENCRYPTION_MASTER_KEY environment variable must be set with at least 32 characters. " +
        "Private keys cannot be secured without a proper encryption master key."
      );
    }
  }

  private getEncryptionKey(userId: string): Buffer {
    // Derive a user-specific key using PBKDF2 with secure master secret
    return crypto.pbkdf2Sync(this.masterSecret, userId, 100000, 32, "sha256");
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(plaintext: string, userId: string): string {
    const key = this.getEncryptionKey(userId);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encrypted
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string, userId: string): string {
    const key = this.getEncryptionKey(userId);
    
    // Parse encrypted data
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }
    
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  }

  /**
   * Hash sensitive data (one-way, for verification only)
   */
  hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }
}

export const encryptionService = new EncryptionService();
