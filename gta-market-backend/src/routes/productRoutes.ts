import { Router } from 'express';
import { getProducts, purchaseProduct } from '../controllers/productController';


export const router = Router();

router.get('/', getProducts);
router.post('/purchase', purchaseProduct);
