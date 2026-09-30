import { Router } from 'express';
import { getProducts, getWeapons,  purchaseWeapon, updateWeapon } from '../controllers/productController';
import { extractToken } from '../middleware/adminRequestHandler';


export const router = Router();

router.get('/', getProducts);
router.get('/weapons', getWeapons);
router.put('/weapons/:weaponId', extractToken, updateWeapon);
router.post('/weapons/:weaponId', purchaseWeapon);
