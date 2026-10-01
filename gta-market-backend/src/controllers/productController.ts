import type { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { InvalidProductError, OutOfStockError, NotEnoughMoneyError } from '../errors/ProductErrors';
import { IncompletePayloadError } from '../errors/AppError';
import { DBManager } from '../db/manager';


export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const dbManager = await DBManager.getInstance();
    res.json(await dbManager.getAllProducts());
  } catch(e) {
    return next(e)
  }  
}


export const getWeapons = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const dbManager = await DBManager.getInstance();
    res.json(await dbManager.getAllWeapons());
  } catch(e) {
    return next(e)
  }
}


export const getAmmo = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const dbManager = await DBManager.getInstance();
    res.json(await dbManager.getAllAmmo());
  } catch(e) {
    return next(e)
  }
}


export const purchaseWeapon = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch(e) {
    return next(e)
  }
}


export const updateWeapon = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch(e) {
    return next(e)
  }
}


export const purchaseAmmo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playerMoney } = req.body;
    const ammoId = parseInt(req.params.ammoId as string);
  
    if (!ammoId || Number.isNaN(ammoId) || !playerMoney) {
      return next(
        new IncompletePayloadError({
         "productId": ammoId ?? null,
         "playerMoney": playerMoney ?? null 
        })
      );
    }
  
    const dbManager = await DBManager.getInstance();
    const product = await dbManager.getAmmoById(ammoId);

    if (!product) return next(new InvalidProductError(ammoId, 'ammo'));

    if (product.stock <= 0) return next(new OutOfStockError(product));

    if (parseInt(playerMoney) < product.price) return next(new NotEnoughMoneyError(playerMoney, product));

    product.stock--;
    dbManager.updateAmmo(product);
  
    return res.json({
      message: `You bought ${product.name}`,
      product
    })
  } catch(e) {
    return next(e)
  }
}


export const updateAmmo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ammoId = parseInt(req.params.amoId as string);
    const partialProduct: Partial<Product> = req.body;

    if (!ammoId || Number.isNaN(ammoId) || !partialProduct) return next(new IncompletePayloadError({
       ammoId,
       "product": partialProduct ?? null
     }));

    const dbManager = await DBManager.getInstance();
    const product = await dbManager.getAmmoById(ammoId);
    if (!product) return next(new InvalidProductError(ammoId, 'ammo'));

    product.name = partialProduct.name || product.name;
    product.description = partialProduct.description || product.description;
    product.price = partialProduct.price || product.price;
    product.stock = partialProduct.stock || product.stock;

    await dbManager.updateWeapon(product);
    return res.status(200).json({
      product
    });
  } catch(e) {
    return next(e)
  }
}
