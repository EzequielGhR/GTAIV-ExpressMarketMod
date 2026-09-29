import type { Request, Response, NextFunction } from 'express';
import type { Product } from '../models/Product'
import { InvalidProductError, OutOfStockError, NotEnoughMoneyError } from '../errors/ProductErrors';
import { IncompletePayloadError } from '../errors/AppError';

//TODO: Temp data - DB is comming
const products: Product[] = [
  {
    id: 1,
    name: "Basseball Bat",
    price: 10,
    description: "Melee Weapon, baseball bat",
    stock: 5
  },
  {
    id: 2,
    name: "Pool Cue",
    price: 10,
    description: "Melee Weapon, pool cue",
    stock: 5
  },
  {
    id: 3,
    name: "Knife",
    price: 10,
    description: "Melee Weapon, baseball bat",
    stock: 5
  },
]


export const getProducts = (_req: Request, res: Response) => {
  res.json(products);
}


export const purchaseProduct = (req: Request, res: Response, next: NextFunction) => {
  const { productId, playerMoney } = req.body;
  if (!productId || !playerMoney) {
    return next(
      new IncompletePayloadError({
       "productId": productId ?? null,
       "playerMoney": playerMoney ?? null 
      })
    );
  }
  
  const product = products.find(p => p.id === parseInt(productId));

  if (!product) return next(new InvalidProductError(productId));

  if (product.stock <= 0) return next(new OutOfStockError(product));

  if (parseInt(playerMoney) < product.price) return next(new NotEnoughMoneyError(playerMoney, product));

  product.stock--;
  return res.json({
    message: `You bought ${product.name}`,
    product
  })
    
}
