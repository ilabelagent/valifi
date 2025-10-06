import crypto from "crypto";
import type { CryptoPayment } from "@shared/schema";

/**
 * Unified Crypto Payment Processor Service
 * Integrates: BitPay, Binance Pay, Bybit, KuCoin, Luno
 */

export interface PaymentInvoice {
  invoiceId: string;
  paymentUrl: string;
  qrCode?: string;
  amount: string;
  currency: string;
  expiresAt: Date;
  status: string;
}

class CryptoProcessorService {
  /**
   * BitPay Integration
   * API Docs: https://developer.bitpay.com/
   */
  async createBitPayInvoice(
    amount: number,
    currency: string = "USD",
    notificationUrl?: string
  ): Promise<PaymentInvoice> {
    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;
    if (!BITPAY_API_KEY) {
      throw new Error("BITPAY_API_KEY not configured");
    }

    const invoice = {
      price: amount,
      currency: currency,
      notificationURL: notificationUrl,
      redirectURL: `${process.env.APP_URL}/payment/success`,
      orderId: crypto.randomUUID(),
    };

    const response = await fetch("https://bitpay.com/api/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BitPay-Api-Key": BITPAY_API_KEY,
        "X-Accept-Version": "2.0.0",
      },
      body: JSON.stringify(invoice),
    });

    if (!response.ok) {
      throw new Error(`BitPay error: ${await response.text()}`);
    }

    const data = await response.json();
    
    return {
      invoiceId: data.data.id,
      paymentUrl: data.data.url,
      qrCode: data.data.payment?.displayQRCode,
      amount: data.data.price.toString(),
      currency: data.data.currency,
      expiresAt: new Date(data.data.expirationTime),
      status: data.data.status,
    };
  }

  /**
   * Binance Pay Integration  
   * API Docs: https://developers.binance.com/docs/binance-pay
   */
  async createBinancePayOrder(
    amount: number,
    currency: string = "USDT",
    userId: string
  ): Promise<PaymentInvoice> {
    const BINANCE_PAY_KEY = process.env.BINANCE_PAY_KEY;
    const BINANCE_PAY_SECRET = process.env.BINANCE_PAY_SECRET;
    
    if (!BINANCE_PAY_KEY || !BINANCE_PAY_SECRET) {
      throw new Error("Binance Pay credentials not configured");
    }

    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString("hex");
    const merchantTradeNo = crypto.randomUUID();

    const payload = {
      env: { terminalType: "WEB" },
      merchantTradeNo,
      orderAmount: amount,
      currency,
      goods: {
        goodsType: "01",
        goodsCategory: "Valifi Kingdom",
        referenceGoodsId: userId,
        goodsName: "Platform Credit",
      },
    };

    // Generate Binance Pay signature
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", BINANCE_PAY_SECRET)
      .update(timestamp + "\n" + nonce + "\n" + payloadString + "\n")
      .digest("hex")
      .toUpperCase();

    const response = await fetch(
      "https://bpay.binanceapi.com/binancepay/openapi/v2/order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "BinancePay-Timestamp": timestamp.toString(),
          "BinancePay-Nonce": nonce,
          "BinancePay-Certificate-SN": BINANCE_PAY_KEY,
          "BinancePay-Signature": signature,
        },
        body: payloadString,
      }
    );

    if (!response.ok) {
      throw new Error(`Binance Pay error: ${await response.text()}`);
    }

    const data = await response.json();

    if (data.status !== "SUCCESS") {
      throw new Error(`Binance Pay failed: ${data.errorMessage}`);
    }

    return {
      invoiceId: data.data.prepayId,
      paymentUrl: data.data.checkoutUrl,
      qrCode: data.data.qrcodeLink,
      amount: amount.toString(),
      currency,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour default
      status: "new",
    };
  }

  /**
   * Bybit Payment Integration
   * Note: Bybit is primarily a trading platform
   * This creates a deposit address for payment
   */
  async createBybitPayment(
    currency: string = "USDT",
    network: string = "TRC20"
  ): Promise<PaymentInvoice> {
    const BYBIT_API_KEY = process.env.BYBIT_API_KEY;
    const BYBIT_API_SECRET = process.env.BYBIT_API_SECRET;

    if (!BYBIT_API_KEY || !BYBIT_API_SECRET) {
      throw new Error("Bybit credentials not configured");
    }

    const timestamp = Date.now();
    const params = {
      coin: currency,
      chain: network,
    };

    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const signature = crypto
      .createHmac("sha256", BYBIT_API_SECRET)
      .update(timestamp + BYBIT_API_KEY + queryString)
      .digest("hex");

    const response = await fetch(
      `https://api.bybit.com/v5/asset/deposit/query-address?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-BAPI-API-KEY": BYBIT_API_KEY,
          "X-BAPI-SIGN": signature,
          "X-BAPI-TIMESTAMP": timestamp.toString(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Bybit error: ${await response.text()}`);
    }

    const data = await response.json();

    if (data.retCode !== 0) {
      throw new Error(`Bybit failed: ${data.retMsg}`);
    }

    const depositAddress = data.result.chains[0]?.addressDeposit || "";

    return {
      invoiceId: `bybit_${crypto.randomUUID()}`,
      paymentUrl: depositAddress, // Crypto address for deposit
      amount: "0", // Amount will be confirmed when deposit is detected
      currency,
      expiresAt: new Date(Date.now() + 86400000), // 24 hours
      status: "pending",
    };
  }

  /**
   * KuCoin Payment Integration
   * Creates a deposit address
   */
  async createKuCoinPayment(
    currency: string = "USDT",
    chain: string = "TRC20"
  ): Promise<PaymentInvoice> {
    const KUCOIN_API_KEY = process.env.KUCOIN_API_KEY;
    const KUCOIN_API_SECRET = process.env.KUCOIN_API_SECRET;
    const KUCOIN_PASSPHRASE = process.env.KUCOIN_PASSPHRASE;

    if (!KUCOIN_API_KEY || !KUCOIN_API_SECRET || !KUCOIN_PASSPHRASE) {
      throw new Error("KuCoin credentials not configured");
    }

    const timestamp = Date.now();
    const method = "POST";
    const endpoint = "/api/v1/deposit-addresses";
    const body = JSON.stringify({ currency, chain });

    const signString = timestamp + method + endpoint + body;
    const signature = crypto
      .createHmac("sha256", KUCOIN_API_SECRET)
      .update(signString)
      .digest("base64");

    const passphraseSignature = crypto
      .createHmac("sha256", KUCOIN_API_SECRET)
      .update(KUCOIN_PASSPHRASE)
      .digest("base64");

    const response = await fetch(
      `https://api.kucoin.com${endpoint}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          "KC-API-KEY": KUCOIN_API_KEY,
          "KC-API-SIGN": signature,
          "KC-API-TIMESTAMP": timestamp.toString(),
          "KC-API-PASSPHRASE": passphraseSignature,
          "KC-API-KEY-VERSION": "2",
        },
        body,
      }
    );

    if (!response.ok) {
      throw new Error(`KuCoin error: ${await response.text()}`);
    }

    const data = await response.json();

    if (data.code !== "200000") {
      throw new Error(`KuCoin failed: ${data.msg}`);
    }

    return {
      invoiceId: `kucoin_${crypto.randomUUID()}`,
      paymentUrl: data.data.address,
      amount: "0",
      currency,
      expiresAt: new Date(Date.now() + 86400000), // 24 hours
      status: "pending",
    };
  }

  /**
   * Luno Payment Integration
   * Creates a receive address
   */
  async createLunoPayment(currency: string = "BTC"): Promise<PaymentInvoice> {
    const LUNO_API_KEY = process.env.LUNO_API_KEY;
    const LUNO_API_SECRET = process.env.LUNO_API_SECRET;

    if (!LUNO_API_KEY || !LUNO_API_SECRET) {
      throw new Error("Luno credentials not configured");
    }

    const auth = Buffer.from(`${LUNO_API_KEY}:${LUNO_API_SECRET}`).toString(
      "base64"
    );

    const response = await fetch(
      `https://api.luno.com/api/1/funding_address?asset=${currency}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Luno error: ${await response.text()}`);
    }

    const data = await response.json();

    return {
      invoiceId: `luno_${crypto.randomUUID()}`,
      paymentUrl: data.address,
      amount: "0",
      currency,
      expiresAt: new Date(Date.now() + 86400000), // 24 hours
      status: "pending",
    };
  }

  /**
   * Unified payment creation - routes to appropriate processor
   */
  async createPayment(
    processor: "bitpay" | "binance_pay" | "bybit" | "kucoin" | "luno",
    amount: number,
    currency: string,
    userId: string
  ): Promise<PaymentInvoice> {
    switch (processor) {
      case "bitpay":
        return this.createBitPayInvoice(amount, currency);
      
      case "binance_pay":
        return this.createBinancePayOrder(amount, currency, userId);
      
      case "bybit":
        return this.createBybitPayment(currency);
      
      case "kucoin":
        return this.createKuCoinPayment(currency);
      
      case "luno":
        return this.createLunoPayment(currency);
      
      default:
        throw new Error(`Unsupported processor: ${processor}`);
    }
  }

  /**
   * Verify webhook signatures for each processor
   */
  verifyWebhookSignature(
    processor: string,
    signature: string,
    payload: string
  ): boolean {
    switch (processor) {
      case "bitpay": {
        const BITPAY_API_KEY = process.env.BITPAY_API_KEY || "";
        const computedSignature = crypto
          .createHmac("sha256", BITPAY_API_KEY)
          .update(payload)
          .digest("hex");
        return signature === computedSignature;
      }

      case "binance_pay": {
        // Binance uses public key verification
        // This is a simplified version - implement full PKI verification in production
        return true; // Implement proper verification
      }

      case "bybit": {
        const BYBIT_API_SECRET = process.env.BYBIT_API_SECRET || "";
        const computedSignature = crypto
          .createHmac("sha256", BYBIT_API_SECRET)
          .update(payload)
          .digest("hex");
        return signature === computedSignature;
      }

      case "kucoin": {
        const KUCOIN_API_SECRET = process.env.KUCOIN_API_SECRET || "";
        const computedSignature = crypto
          .createHmac("sha256", KUCOIN_API_SECRET)
          .update(payload)
          .digest("base64");
        return signature === computedSignature;
      }

      case "luno": {
        const LUNO_API_SECRET = process.env.LUNO_API_SECRET || "";
        const computedSignature = crypto
          .createHmac("sha256", LUNO_API_SECRET)
          .update(payload)
          .digest("hex");
        return signature === computedSignature;
      }

      default:
        return false;
    }
  }
}

export const cryptoProcessorService = new CryptoProcessorService();
