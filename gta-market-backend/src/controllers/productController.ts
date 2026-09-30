import type { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { InvalidProductError, OutOfStockError, NotEnoughMoneyError } from '../errors/ProductErrors';
import { IncompletePayloadError } from '../errors/AppError';
import { DBManager } from '../db/manager';


export const getProducts = async (_req: Request, res: Response) => {
  const dbManager = await DBManager.getInstance();
  res.json(await dbManager.getAllProducts());
}


export const getWeapons = async (_req: Request, res: Response) => {
  const dbManager = await DBManager.getInstance();
  res.json(await dbManager.getAllWeapons());
}


export const purchaseWeapon = async (req: Request, res: Response, next: NextFunction) => {
  const { playerMoney } = req.body;
  const weaponId = parseInt(req.params.weaponId as string);
  
  if (!weaponId || Number.isNaN(weaponId) || !playerMoney) {
    return next(
      new IncompletePayloadError({
       "productId": weaponId ?? null,
       "playerMoney": playerMoney ?? null 
      })
    );
  }
  
  const dbManager = await DBManager.getInstance();
  const product = await dbManager.getWeaponById(weaponId);

  if (!product) return next(new InvalidProductError(weaponId, 'weapon'));

  if (product.stock <= 0) return next(new OutOfStockError(product));

  if (parseInt(playerMoney) < product.price) return next(new NotEnoughMoneyError(playerMoney, product));

  product.stock--;
  dbManager.updateWeapon(product);
  
  return res.json({
    message: `You bought ${product.name}`,
    product
  })  
}


export const updateWeapon = async (req: Request, res: Response, next: NextFunction) => {
  const weaponId = parseInt(req.params.weaponId as string);
  const partialProduct: Partial<Product> = req.body;

  if (!weaponId || Number.isNaN(weaponId) || !partialProduct) return next(new IncompletePayloadError({
     weaponId,
     "product": partialProduct ?? null
   }));

  const dbManager = await DBManager.getInstance();
  const product = await dbManager.getWeaponById(weaponId);
  if (!product) return next(new InvalidProductError(weaponId, 'weapon'));

  product.name = partialProduct.name || product.name;
  product.description = partialProduct.description || product.description;
  product.price = partialProduct.price || product.price;
  product.stock = partialProduct.stock || product.stock;

  await dbManager.updateWeapon(product);
  return res.status(200).json({
    product
  });
}
