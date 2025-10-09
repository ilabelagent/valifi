import { storage } from "./storage";
import type { InsertEtherealElement, InsertEtherealOwnership, InsertIndividualAsset } from "@shared/schema";

export class EtherealService {
  async mintEtherealElement(
    name: string,
    elementType: string,
    power: number,
    rarity: string,
    description: string,
    totalSupply?: number,
    attributes?: any,
    imageUrl?: string,
    animationUrl?: string
  ) {
    const elementData: InsertEtherealElement = {
      name,
      description,
      elementType,
      power,
      rarity,
      attributes,
      imageUrl,
      animationUrl,
      totalSupply,
      mintedCount: 0,
    };

    const element = await storage.createEtherealElement(elementData);
    return element;
  }

  async purchaseElement(userId: string, elementId: string, quantity: number = 1) {
    const element = await storage.getEtherealElement(elementId);
    
    if (!element) {
      throw new Error("Element not found");
    }

    if (element.totalSupply !== null && 
        element.totalSupply !== undefined && 
        (element.mintedCount || 0) + quantity > element.totalSupply) {
      throw new Error("Not enough supply available");
    }

    const existingOwnership = await storage.getEtherealOwnership(userId, elementId);

    if (existingOwnership) {
      await storage.updateEtherealOwnershipQuantity(
        userId,
        elementId,
        existingOwnership.quantity + quantity
      );
    } else {
      await storage.createEtherealOwnership({
        userId,
        elementId,
        quantity,
      });
    }

    await storage.updateEtherealElementMintCount(
      elementId,
      (element.mintedCount || 0) + quantity
    );

    const assetData: InsertIndividualAsset = {
      userId,
      name: element.name,
      assetType: "ethereal",
      marketValue: this.calculateElementValue(element).toString(),
      purchasePrice: this.calculateElementValue(element).toString(),
      quantity: quantity.toString(),
      metadata: {
        elementId: element.id,
        elementType: element.elementType,
        power: element.power,
        rarity: element.rarity,
        attributes: element.attributes,
      },
      imageUrl: element.imageUrl,
    };

    await storage.createIndividualAsset(assetData);

    return {
      element,
      ownership: await storage.getEtherealOwnership(userId, elementId),
    };
  }

  async transferElement(
    fromUserId: string,
    toUserId: string,
    elementId: string,
    quantity: number = 1
  ) {
    const fromOwnership = await storage.getEtherealOwnership(fromUserId, elementId);

    if (!fromOwnership) {
      throw new Error("Source user does not own this element");
    }

    if (fromOwnership.quantity < quantity) {
      throw new Error("Insufficient element quantity");
    }

    await storage.updateEtherealOwnershipQuantity(
      fromUserId,
      elementId,
      fromOwnership.quantity - quantity
    );

    const toOwnership = await storage.getEtherealOwnership(toUserId, elementId);

    if (toOwnership) {
      await storage.updateEtherealOwnershipQuantity(
        toUserId,
        elementId,
        toOwnership.quantity + quantity
      );
    } else {
      await storage.createEtherealOwnership({
        userId: toUserId,
        elementId,
        quantity,
      });
    }

    return {
      success: true,
      message: "Element transferred successfully",
    };
  }

  async getElementMarketplace() {
    const elements = await storage.getAllEtherealElements();
    
    return elements.map(element => ({
      ...element,
      available: element.totalSupply === null || element.totalSupply === undefined
        ? true
        : (element.mintedCount || 0) < element.totalSupply,
      remainingSupply: element.totalSupply === null || element.totalSupply === undefined
        ? null
        : element.totalSupply - (element.mintedCount || 0),
      price: this.calculateElementValue(element),
    }));
  }

  async getUserCollection(userId: string) {
    const ownerships = await storage.getUserEtherealOwnerships(userId);
    return ownerships;
  }

  async getElementDetails(elementId: string) {
    const element = await storage.getEtherealElement(elementId);
    
    if (!element) {
      throw new Error("Element not found");
    }

    return {
      ...element,
      available: element.totalSupply === null || element.totalSupply === undefined
        ? true
        : (element.mintedCount || 0) < element.totalSupply,
      remainingSupply: element.totalSupply === null || element.totalSupply === undefined
        ? null
        : element.totalSupply - (element.mintedCount || 0),
      price: this.calculateElementValue(element),
    };
  }

  private calculateElementValue(element: any): number {
    let baseValue = 100;

    const rarityMultipliers: Record<string, number> = {
      common: 1,
      rare: 2.5,
      epic: 5,
      legendary: 10,
      divine: 25,
    };

    const rarityMultiplier = rarityMultipliers[element.rarity.toLowerCase()] || 1;
    const powerMultiplier = 1 + (element.power || 0) / 1000;

    const scarcityMultiplier = element.totalSupply && element.totalSupply < 100
      ? 1 + (100 - element.totalSupply) / 100
      : 1;

    return Math.floor(baseValue * rarityMultiplier * powerMultiplier * scarcityMultiplier);
  }

  async getElementsByRarity(rarity: string) {
    const allElements = await storage.getAllEtherealElements();
    return allElements.filter(e => e.rarity.toLowerCase() === rarity.toLowerCase());
  }

  async getElementsByType(elementType: string) {
    const allElements = await storage.getAllEtherealElements();
    return allElements.filter(e => e.elementType.toLowerCase() === elementType.toLowerCase());
  }

  async getTopElements(limit: number = 10) {
    const allElements = await storage.getAllEtherealElements();
    return allElements
      .sort((a, b) => (b.power || 0) - (a.power || 0))
      .slice(0, limit);
  }
}

export const etherealService = new EtherealService();
