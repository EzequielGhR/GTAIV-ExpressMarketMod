import { Router } from 'express';
import { getProducts, getWeapons,  purchaseWeapon } from '../controllers/productController';


export const router = Router();

router.get('/', getProducts);
router.get('/weapons', getWeapons);
router.post('/weapons/:weaponId', purchaseWeapon);
