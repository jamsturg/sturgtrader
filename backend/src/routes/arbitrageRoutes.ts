
import express from 'express';
import { arbitrageController } from '../controllers/arbitrageController';

/**
 * API routes for the high-speed arbitrage trading system
 */
export const arbitrageRouter = express.Router();

// System management routes
arbitrageRouter.post('/initialize', arbitrageController.initialize.bind(arbitrageController));
arbitrageRouter.post('/start', arbitrageController.start.bind(arbitrageController));
arbitrageRouter.post('/stop', arbitrageController.stop.bind(arbitrageController));
arbitrageRouter.post('/shutdown', arbitrageController.shutdown.bind(arbitrageController));
arbitrageRouter.post('/config', arbitrageController.updateConfig.bind(arbitrageController));

// Opportunity management routes
arbitrageRouter.get('/opportunities', arbitrageController.getOpportunities.bind(arbitrageController));
arbitrageRouter.post('/opportunities/:opportunityId/execute', arbitrageController.executeOpportunity.bind(arbitrageController));

// Informational routes
arbitrageRouter.get('/stats', arbitrageController.getStats.bind(arbitrageController));
arbitrageRouter.get('/exchanges', arbitrageController.getSupportedExchanges.bind(arbitrageController));
arbitrageRouter.get('/pairs', arbitrageController.getSupportedPairs.bind(arbitrageController));
arbitrageRouter.get('/status', arbitrageController.getStatus.bind(arbitrageController));
