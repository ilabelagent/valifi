import { create, IPFSHTTPClient } from "ipfs-http-client";

/**
 * IPFS Service for NFT Metadata Storage
 * Handles upload and retrieval of NFT metadata, images, and files
 */
export class IPFSService {
  private client: IPFSHTTPClient;
  private gatewayUrl: string;

  constructor() {
    const ipfsEndpoint = process.env.IPFS_ENDPOINT || "https://ipfs.infura.io:5001";
    const projectId = process.env.IPFS_PROJECT_ID;
    const projectSecret = process.env.IPFS_PROJECT_SECRET;

    if (projectId && projectSecret) {
      const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
      this.client = create({
        url: ipfsEndpoint,
        headers: {
          authorization: auth,
        },
      });
    } else {
      this.client = create({ url: ipfsEndpoint });
    }

    this.gatewayUrl = process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs/";
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadMetadata(metadata: any): Promise<string> {
    try {
      const metadataString = JSON.stringify(metadata);
      const result = await this.client.add(metadataString);
      const ipfsUrl = `ipfs://${result.path}`;
      console.log(`[IPFS] Uploaded metadata: ${ipfsUrl}`);
      return ipfsUrl;
    } catch (error: any) {
      console.error(`[IPFS] Failed to upload metadata:`, error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Upload file (image, audio, video) to IPFS
   */
  async uploadFile(file: Buffer | Uint8Array, filename: string): Promise<string> {
    try {
      const result = await this.client.add({
        path: filename,
        content: file,
      });
      const ipfsUrl = `ipfs://${result.path}`;
      console.log(`[IPFS] Uploaded file ${filename}: ${ipfsUrl}`);
      return ipfsUrl;
    } catch (error: any) {
      console.error(`[IPFS] Failed to upload file:`, error);
      throw new Error(`IPFS file upload failed: ${error.message}`);
    }
  }

  /**
   * Upload batch of files to IPFS
   */
  async uploadBatch(files: Array<{ filename: string; content: Buffer | Uint8Array }>): Promise<string[]> {
    try {
      const results: string[] = [];
      for (const file of files) {
        const ipfsUrl = await this.uploadFile(file.content, file.filename);
        results.push(ipfsUrl);
      }
      console.log(`[IPFS] Uploaded ${files.length} files in batch`);
      return results;
    } catch (error: any) {
      console.error(`[IPFS] Batch upload failed:`, error);
      throw new Error(`IPFS batch upload failed: ${error.message}`);
    }
  }

  /**
   * Create NFT metadata following OpenSea standards
   */
  createNFTMetadata(params: {
    name: string;
    description: string;
    image: string; // IPFS URL
    attributes?: Array<{ trait_type: string; value: string | number }>;
    externalUrl?: string;
    animationUrl?: string;
    backgroundColor?: string;
    royaltyBps?: number; // Basis points (e.g., 500 = 5%)
    royaltyRecipient?: string;
  }): any {
    const metadata: any = {
      name: params.name,
      description: params.description,
      image: params.image,
    };

    if (params.attributes && params.attributes.length > 0) {
      metadata.attributes = params.attributes;
    }

    if (params.externalUrl) {
      metadata.external_url = params.externalUrl;
    }

    if (params.animationUrl) {
      metadata.animation_url = params.animationUrl;
    }

    if (params.backgroundColor) {
      metadata.background_color = params.backgroundColor;
    }

    if (params.royaltyBps && params.royaltyRecipient) {
      metadata.seller_fee_basis_points = params.royaltyBps;
      metadata.fee_recipient = params.royaltyRecipient;
    }

    return metadata;
  }

  /**
   * Get HTTP URL from IPFS URL
   */
  getHttpUrl(ipfsUrl: string): string {
    if (ipfsUrl.startsWith("ipfs://")) {
      return ipfsUrl.replace("ipfs://", this.gatewayUrl);
    }
    return ipfsUrl;
  }

  /**
   * Retrieve metadata from IPFS
   */
  async getMetadata(ipfsUrl: string): Promise<any> {
    try {
      const cid = ipfsUrl.replace("ipfs://", "");
      const chunks = [];
      
      for await (const chunk of this.client.cat(cid)) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      const metadata = JSON.parse(buffer.toString());
      
      console.log(`[IPFS] Retrieved metadata from ${ipfsUrl}`);
      return metadata;
    } catch (error: any) {
      console.error(`[IPFS] Failed to retrieve metadata:`, error);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }
}

export const ipfsService = new IPFSService();
