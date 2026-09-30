import { Product } from '../models/Product';

export type SourceItem = Product & {
  type: string
}

export interface SourceData {
  weapons: SourceItem[]
  // TODO: We might add more product types
};

export interface TokenData {
  token: string,
  token_age: string
}

export type AdminItem = TokenData & {
  username: string,
  password: string
}
