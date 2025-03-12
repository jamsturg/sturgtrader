import axios from 'axios';
import { ethers, Wallet } from 'ethers';
import { logger } from '../../../utils/logger';

// Constants from frontend SDK, we might want to move these to a separate file
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function getTimestampMs(): number {
    return Date.now()
}

/**
 * Interface for Hyperliquid order parameters
 */
interface HyperliquidOrderParams {
    symbol: string;
    isBuy: boolean;
    size: number;
    price: number;
    orderType: 'limit' | 'market' | 'postOnly';
    reduceOnly?: boolean;
    timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

/**
 * Interface for Hyperliquid position
 */
interface HyperliquidPosition {
    symbol: string;
    size: number;
    entryPrice: number;
    markPrice: number;
    pnl: number;
    pnlPercent: number;
    liquidationPrice?: number;
    leverage: number;
}

interface OrderSpec {
    order: {
        asset: number;
        isBuy: boolean;
        reduceOnly: boolean;
        limitPx: number;
        sz: number;
    };
    orderType: OrderType;
}

type OrderType =
    | {
        limit: {
            tif: 'Gtc';
        };
    }
    | {
        limit: {
            tif: 'Ioc';
        };
    }
    | {
        limit: {
            tif: 'Fok';
        };
    }
    | 'Market'
    | 'Trigger'
    | 'Oco';

interface OrderWire {
    asset: number;
    isBuy: boolean;
    reduceOnly: boolean;
    limitPx: string;
    sz: string;
    orderType: OrderType;
}

interface CancelRequest {
    coin: string;
    oid: number;
}

interface ApiResponse {
    status: string;
    response?: any;
    error?: string;
}

interface Universe {
    universe: Array<{
        name: string;
    }>
}

/**
 * Service for interacting with the Hyperliquid API
 * Based on the Hyperliquid Python SDK and frontend TypeScript SDK
 */
class HyperliquidService {
    private apiUrl: string;
    private apiKey: string | null = null;
    private signer: ethers.Wallet | null = null;
    private accountAddress: string | null = null;
    private isInitialized = false;
    private vaultAddress: string | undefined;
    private meta: Universe | null = null;
    private coinToAsset: Record<string, number> | null = null;

    constructor() {
        this.apiUrl = process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz';
        this.initialize();
    }

    /**
     * Initialize the Hyperliquid service
     */
    public async initialize(): Promise<boolean> {
        try {
            if (process.env.HYPERLIQUID_SECRET_KEY) {
                // Initialize with private key if available
                this.signer = new ethers.Wallet(process.env.HYPERLIQUID_SECRET_KEY, new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL));
                this.accountAddress = process.env.HYPERLIQUID_ACCOUNT_ADDRESS || this.signer.address;
                this.vaultAddress = process.env.HYPERLIQUID_VAULT_ADDRESS; // Optional vault address

                // Fetch metadata
                await this.fetchMetadata();

                logger.info(`Hyperliquid service initialized with account: ${this.accountAddress}`);
            } else if (process.env.HYPERLIQUID_API_KEY) {
                // Initialize with API key if available
                this.apiKey = process.env.HYPERLIQUID_API_KEY;
                this.accountAddress = process.env.HYPERLIQUID_ACCOUNT_ADDRESS || '';
                logger.info(`Hyperliquid service initialized with API key`);
            } else {
                logger.warn('Hyperliquid service initialized in read-only mode');
            }

            this.isInitialized = true;
            return true;
        } catch (error: any) {
            logger.error(`Failed to initialize Hyperliquid service: ${error.message}`);
            return false;
        }
    }

    private async fetchMetadata(): Promise<void> {
        try {
            const response = await axios.post(`${this.apiUrl}/info`, {
                type: 'meta',
            });
            this.meta = response.data;
            this.coinToAsset = {};
            if (!this.meta) {
                throw new Error("Failed to fetch metadata from Hyperliquid API.");
            }
            for (const assetInfo of this.meta.universe) {
                this.coinToAsset[assetInfo.name] = this.meta.universe.findIndex(
                    (a) => a.name === assetInfo.name
                );
            }

        } catch (error: any) {
            logger.error(`Failed to fetch metadata: ${error.message}`);
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    /**
     * Get user account state
     */
    public async getUserState(): Promise<any> {
        if (!this.accountAddress) {
            throw new Error('Account address not set');
        }

        try {
            const response = await axios.post(`${this.apiUrl}/info`, {
                type: 'userState',
                user: this.accountAddress
            });

            return response.data;
        } catch (error: any) {
            logger.error(`Failed to get user state: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get active positions for the user
     */
    public async getPositions(): Promise<HyperliquidPosition[]> {
        try {
            const userState = await this.getUserState();

            // Map to our interface
            const positions: HyperliquidPosition[] = userState.assetPositions
                .filter((p: any) => p.position && p.position.szi !== 0)
                .map((p: any) => {
                    const position = p.position;
                    const entryPrice = parseFloat(position.entryPx);
                    const markPrice = parseFloat(position.markPx);
                    const size = parseFloat(position.szi);
                    const leverage = parseFloat(position.leverage || "1");
                    const pnl = (markPrice - entryPrice) * size;
                    const pnlPercent = (markPrice / entryPrice - 1) * 100 * (size > 0 ? 1 : -1);

                    return {
                        symbol: p.name,
                        size,
                        entryPrice,
                        markPrice,
                        pnl,
                        pnlPercent,
                        liquidationPrice: position.liquidationPx ? parseFloat(position.liquidationPx) : undefined,
                        leverage
                    };
                });

            return positions;
        } catch (error: any) {
            logger.error(`Failed to get positions: ${error.message}`);
            throw error;
        }
    }

    // Helper functions from frontend SDK, adapted for backend
    private orderSpecPreprocessing(orderSpec: OrderSpec) {
        const orderType = orderSpec.orderType;
        let orderTypeNumber: number;

        if ('limit' in orderType) {
            if (orderType.limit.tif === 'Gtc') {
                orderTypeNumber = 0;
            } else if (orderType.limit.tif === 'Ioc') {
                orderTypeNumber = 1;
            } else if (orderType.limit.tif === 'Fok') {
                orderTypeNumber = 2;
            } else {
                throw new Error('Invalid TIF');
            }
        } else if (orderType === 'Market') {
            orderTypeNumber = 3;
        } else if (orderType === 'Trigger') {
            orderTypeNumber = 4;
        } else {
            throw new Error(`Invalid order type: ${JSON.stringify(orderType)}`);
        }

        return [
            orderSpec.order.asset,
            orderSpec.order.isBuy,
            orderSpec.order.limitPx * 10000n, // Convert to fixed point
            orderSpec.order.sz * 10000n, // Convert to fixed point
            orderSpec.order.reduceOnly,
            orderTypeNumber,
            0n, // Placeholder for oraclePx, not used in mainnet
        ];
    }

    private orderSpecToOrderWire(orderSpec: OrderSpec): OrderWire {
        const orderType = orderSpec.orderType;
        let orderTypeWire: OrderType;

        if ('limit' in orderType) {
            if (orderType.limit.tif === 'Gtc') {
                orderTypeWire = { limit: { tif: 'Gtc' } };
            } else if (orderType.limit.tif === 'Ioc') {
                orderTypeWire = { limit: { tif: 'Ioc' } };
            } else if (orderType.limit.tif === 'Fok') {
                orderTypeWire = { limit: { tif: 'Fok' } };
            } else {
                throw new Error('Invalid TIF');
            }
        } else if (orderType === 'Market') {
            orderTypeWire = 'Market'
        } else if (orderType === 'Trigger') {
            orderTypeWire = 'Trigger'
        }
          else {
            throw new Error(`Invalid order type: ${JSON.stringify(orderType)}`);
        }

        return {
            asset: orderSpec.order.asset,
            isBuy: orderSpec.order.isBuy,
            reduceOnly: orderSpec.order.reduceOnly,
            limitPx: orderSpec.order.limitPx.toString(),
            sz: orderSpec.order.sz.toString(),
            orderType: orderTypeWire,
        };
    }

    //Signatures
    private async signL1Action(
        wallet: Wallet,
        types: string[],
        values: any[],
        vault: string,
        nonce: number,
    ) {
        const hash = ethers.solidityPackedKeccak256(
            ['string', 'address', 'uint256', 'bytes32', 'bytes32'],
            [
                'Hyperliquid',
                vault,
                nonce,
                ethers.solidityPackedKeccak256(['string'], ['Order']),
                ethers.solidityPackedKeccak256(types, values),
            ],
        );
        const signature = await wallet.signMessage(ethers.toBeArray(hash));
        const { v, r, s } = ethers.Signature.from(signature);
        return { v, r, s };
    }

    private async signUsdTransferAction(wallet: Wallet, payload: any) {
        const hash = ethers.solidityPackedKeccak256(
            ['string', 'string', 'address', 'uint256', 'uint256'],
            ['USD Transfer', payload.destination, payload.amount, payload.time, 0],
        );
        const signature = await wallet.signMessage(ethers.toBeArray(hash));
        const { v, r, s } = ethers.Signature.from(signature);
        return { v, r, s };
    }

    // Exchange methods
    private async _postAction(
        action:
            | {
                type: 'cancel';
                cancels: { asset: number; oid: number }[];
            }
            | {
                type: 'order';
                grouping: string | number | null;
                orders: OrderWire[];
            }
            | {
                type: 'usdTransfer';
                chain: string;
                payload: any;
            },
        signature: { r: string; s: string; v: number },
        nonce: number,
    ): Promise<ApiResponse> {
        const payload = {
            action,
            nonce,
            signature,
            vaultAddress: this.vaultAddress,
        };
        return await axios.post(`${this.apiUrl}/exchange`, payload);
    }

    async order(
        coin: string,
        isBuy: boolean,
        sz: number,
        limitPx: number,
        orderType: OrderType,
        reduceOnly = false,
    ): Promise<ApiResponse> {
        return await this.bulkOrders([
            {
                coin,
                isBuy,
                sz,
                limitPx,
                orderType,
                reduceOnly,
            },
        ]);
    }

    async bulkOrders(orderRequests: HyperliquidOrderParams[]): Promise<ApiResponse> {
        if (!this.signer) {
            throw new Error('Wallet not initialized. Cannot place orders.');
        }
        if (!this.coinToAsset || !this.meta) {
            throw new Error('Metadata not initialized. Cannot place orders.');
        }
        const orderSpecs: OrderSpec[] = orderRequests.map((order) => ({
            order: {
                asset: this.coinToAsset![order.symbol],
                isBuy: order.isBuy,
                reduceOnly: order.reduceOnly === undefined ? false : order.reduceOnly,
                limitPx: order.price,
                sz: order.size,
            },
            orderType: order.orderType === 'limit' ? { limit: { tif: order.timeInForce === 'IOC' ? 'Ioc' : order.timeInForce === 'FOK' ? 'Fok' : 'Gtc' } } : order.orderType === 'market' ? "Market" : "Trigger", // Assuming 'postOnly' maps to a limit order with 'Gtc'
        }));

        const timestamp = getTimestampMs();
        const grouping = 'na';

        const signature = await this.signL1Action(
            this.signer,
            ['(uint32,bool,uint64,uint64,bool,uint8,uint64)[]', 'uint8'],
            [
                orderSpecs.map((os) => this.orderSpecPreprocessing(os)),
                0, // Assuming 'na' maps to 0
            ],
            this.vaultAddress === undefined ? ZERO_ADDRESS : this.vaultAddress,
            timestamp,
        );

        return await this._postAction(
            {
                type: 'order',
                grouping,
                orders: orderSpecs.map(this.orderSpecToOrderWire, this),
            },
            signature,
            timestamp,
        );
    }

    async cancel(coin: string, oid: number): Promise<ApiResponse> {
        return this.bulkCancel([{ coin, oid }]);
    }

    async bulkCancel(cancelRequests: CancelRequest[]): Promise<ApiResponse> {
        if (!this.signer) {
            throw new Error('Wallet not initialized. Cannot cancel orders.');
        }
        if (!this.coinToAsset || !this.meta) {
            throw new Error('Metadata not initialized. Cannot place orders.');
        }
        const timestamp = getTimestampMs();
        const signature = await this.signL1Action(
            this.signer,
            ['(uint32,uint64)[]'],
            [
                cancelRequests.map((cancel) => [
                    this.coinToAsset![cancel.coin],
                    cancel.oid,
                ]),
            ],
            this.vaultAddress === undefined ? ZERO_ADDRESS : this.vaultAddress,
            timestamp,
        );

        return this._postAction(
            {
                type: 'cancel',
                cancels: cancelRequests.map((cancel) => ({
                    asset: this.coinToAsset![cancel.coin],
                    oid: cancel.oid,
                })),
            },
            signature,
            timestamp,
        );
    }

    async usdTransfer(
        amount: string,
        destination: string | undefined = this.signer?.address,
    ): Promise<ApiResponse> {
        if (!this.signer) {
            throw new Error('Wallet not initialized. Cannot transfer USD.');
        }
        const timestamp = getTimestampMs();
        const payload = {
            destination,
            amount,
            time: timestamp,
        };
        const signature = await this.signUsdTransferAction(this.signer, payload);

        return this._postAction(
            {
                type: 'usdTransfer',
                chain: 'Arbitrum', // Assuming 'Arbitrum' as the chain
                payload,
            },
            signature,
            timestamp,
        );
    }

    /**
     * Place an order on Hyperliquid
     */
    public async placeOrder(params: HyperliquidOrderParams): Promise<any> {
        if (!this.signer) {
            throw new Error('Wallet not initialized');
        }

        try {
            const orderResponse = await this.order(params.symbol, params.isBuy, params.size, params.price, params.orderType === 'limit' ? { limit: { tif: params.timeInForce === 'IOC' ? 'Ioc' : params.timeInForce === 'FOK' ? 'Fok' : 'Gtc'}} : params.orderType === 'market' ? "Market" : "Trigger", params.reduceOnly);
            return orderResponse
        } catch (error: any) {
            logger.error(`Failed to place order: ${error.message}`);
            throw error;
        }
    }

    /**
     * Cancel an order
     */
    public async cancelOrder(symbol: string, orderId: string): Promise<any> {
        if (!this.signer) {
            throw new Error('Wallet not initialized');
        }

        try {
            const cancelResponse = await this.cancel(symbol, Number(orderId));
            return cancelResponse;
        } catch (error: any) {
            logger.error(`Failed to cancel order: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get open orders
     */
    public async getOpenOrders(): Promise<any> {
        if (!this.accountAddress) {
            throw new Error('Account address not set');
        }

        try {
            const response = await axios.post(`${this.apiUrl}/info`, {
                type: 'openOrders',
                user: this.accountAddress
            });

            return response.data;
        } catch (error: any) {
            logger.error(`Failed to get open orders: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get market data for a symbol
     */
    public async getMarketData(symbol: string): Promise<any> {
        try {
            const response = await axios.post(`${this.apiUrl}/info`, {
                type: 'metaAndAssetCtxs'
            });

            // Find the specific asset data
            const allAssets = response.data.assetCtxs;
            const assetData = allAssets.find((asset: any) => asset.name === symbol);

            if (!assetData) {
                throw new Error(`Asset ${symbol} not found`);
            }

            return assetData;
        } catch (error: any) {
            logger.error(`Failed to get market data: ${error.message}`);
            throw error;
        }
    }
}

// Create singleton instance
const hyperliquidService = new HyperliquidService();

// Export as default
export default hyperliquidService;
