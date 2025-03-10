import express from 'express';
import hyperliquidController from '../controllers/trading/hyperliquidController';

const router = express.Router();

// GET routes
router.get('/positions', hyperliquidController.getPositions.bind(hyperliquidController));
router.get('/orders', hyperliquidController.getOpenOrders.bind(hyperliquidController));
router.get('/market/:symbol', hyperliquidController.getMarketData.bind(hyperliquidController));

// POST routes
router.post('/order', hyperliquidController.placeOrder.bind(hyperliquidController));
router.post('/cancel', hyperliquidController.cancelOrder.bind(hyperliquidController));

export default router;
