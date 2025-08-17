import { Router } from 'express';
import {
    swapAssets,
    transferMaturity,
    investSpectrumPlan,
    stakeCrypto,
    stakeStock,
    investReit,
    investNftFractional,
    getStakableStocks,
    getReitProperties,
    getInvestableNfts
} from '../controllers/investmentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/stakable-stocks', protect, getStakableStocks);
router.get('/reit-properties', protect, getReitProperties);
router.get('/investable-nfts', protect, getInvestableNfts);

router.post('/swap', protect, swapAssets);
router.post('/:id/transfer-maturity', protect, transferMaturity);
router.post('/spectrum-plan', protect, investSpectrumPlan);
router.post('/stake-crypto', protect, stakeCrypto);
router.post('/stake-stock', protect, stakeStock);
router.post('/reit', protect, investReit);
router.post('/nft-fractional', protect, investNftFractional);


export default router;
