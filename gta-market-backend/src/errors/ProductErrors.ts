import { RequestError } from './AppError';
import type { Product } from '../models/Product';


export class InvalidProductError extends RequestError {
  constructor(id: number, type: string) {
    super(404, `product of type '${type}' and id '${id}' does not exist`);
  }
}


export class OutOfStockError extends RequestError {
  constructor(product: Product) {
    super(400, `product '${product.name}(${product.id})' is out of stock`);
  }
}


export class NotEnoughMoneyError extends RequestError {
  constructor(playerMoney: number, product: Product) {
    super(400, `Not enough money for '${product.name}'. Money: ${playerMoney}, Price: ${product.price}`);
  }
}
