import { Router } from 'express';
import { authenticate, getToken } from '../controllers/adminController'


export const router =  Router();
router.post("/", authenticate);
router.post("/token", getToken);
