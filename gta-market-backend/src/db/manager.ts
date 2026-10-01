import fs from 'fs/promises';
import type { PathLike } from 'fs';
import Path from 'path';
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import { randomUUID } from 'crypto';
import { TableNames } from './enums';
import { type SourceItem, SourceData, TokenData } from './types';
import { Product } from '../models/Product';


const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

const DATA_PATH = Path.join(__dirname, "..", "..", "sources");
const WEAPONS_CSV_PATH = Path.join(DATA_PATH, "weapons.csv");
const AMMO_CSV_PATH = Path.join(DATA_PATH, "ammo.csv");

const PRODUCTS_CREATE_SQL = `
  CREATE TABLE IF NOT EXISTS ${TableNames.PRODUCTS} (
    id INT NOT NULL,
    name VARCHAR(255),
    type VARCHAR(31),
    description VARCHAR(255),
    stock INT NOT NULL,
    price FLOAT NOT NULL
  )
`
const ADMIN_CREATE_SQL = `
  CREATE TABLE IF NOT EXISTS ${TableNames.ADMIN} (
    username VARCHAR(31) NOT NULL,
    password VARCHAR(31) NOT NULL,
    token VARCHAR(255),
    token_age DATETIME
  )
`

const ADMIN_INIT_DATA = `
  INSERT INTO ${TableNames.ADMIN}
  VALUES ('${ADMIN_USER}', '${ADMIN_PASSWORD}', NULL, NULL)
`;

export class DBManager {
  private database: Database;
  private static instance: DBManager | null = null;

  private constructor(database: Database) {
    this.database = database;
  }

  public static async getInstance(): Promise<DBManager> {
    if (!DBManager.instance) {
      console.log("Allocating new DB manager instance");
      const database = await DBManager.openDb();
      await DBManager.createTables(database);
      DBManager.instance = new DBManager(database);
    }

    return DBManager.instance;
  }

  public async close(): Promise<void> {
    console.log("Closing Database");
    await this.closeDb();
  }

  public async getAllProducts(): Promise<SourceItem[]> {
    const result = await this.database.all(`SELECT * FROM ${TableNames.PRODUCTS}`);
    return result;
  }

  public async getAllWeapons(): Promise<Product[]> {
    const result = await this.database.all(`
      SELECT * FROM ${TableNames.PRODUCTS}
      WHERE type='weapon'
    `);

    return result.map(r => this.formatProduct(r));
  }

  public async getAllAmmo(): Promise<Product[]> {
    const result = await this.database.all(`
      SELECT * FROM ${TableNames.PRODUCTS}
      WHERE type='ammo'
    `);

    return result.map(r => this.formatProduct(r));
  }

  public async getWeaponById(weaponId: number): Promise<Product | null> {
    const result = await this.database.get(`
      SELECT * FROM ${TableNames.PRODUCTS}
      WHERE type = 'weapon'
      AND id = ?
    `, weaponId);

    
    if (!result) return null;

    return this.formatProduct(result);
  }

  public async getAmmoById(ammoId: number): Promise<Product | null> {
    const result = await this.database.get(`
      SELECT * FROM ${TableNames.PRODUCTS}
      WHERE type = 'ammo'
      AND id = ?
    `, ammoId);

    if (!result) return null;

    return this.formatProduct(result);
  }

  public async updateWeapon(weapon: Product) {
    await this.database.exec(`
      UPDATE ${TableNames.PRODUCTS}
      SET name = '${weapon.name}',
        description = '${weapon.description}',
        stock = ${weapon.stock},
        price = ${weapon.price}
      WHERE id = ${weapon.id}
        AND type = 'weapon'
    `);
  }

  public async updateAmmo(ammo: Product) {
    await this.database.exec(`
      UPDATE ${TableNames.PRODUCTS}
      SET name = '${ammo.name}',
        description = '${ammo.description}',
        stock = ${ammo.stock},
        price = ${ammo.price}
      WHERE id = ${ammo.id}
        AND type = 'ammo'
    `);
  }

  public async getAdminToken(user: string, password: string): Promise<TokenData> {
    const result = await this.database.get(`
      SELECT token, token_age FROM ${TableNames.ADMIN}
      WHERE username = ?
      AND password = ?
    `, user, password);

    return result;
  }


  public async validateAdminToken(token: string): Promise<TokenData> {
    const result = await this.database.get(`
      SELECT token, token_age FROM ${TableNames.ADMIN}
      WHERE token = ?
    `, token);
  
    return result;
  }

  public async updateAdminToken(user: string, password: string): Promise<string | null> {
    const result = await this.database.get(`
      SELECT * FROM ${TableNames.ADMIN}
      WHERE username = ?
      AND password = ?
    `, user, password);

    if (!result) return null;

    const token = randomUUID();
    const tokenAge = new Date()

    await this.database.exec(`
      UPDATE ${TableNames.ADMIN}
      SET token = '${token}',
        token_age = '${tokenAge.toISOString()}'
      WHERE username = '${user}'
      AND password = '${password}'
    `);

    return token;
  }

  private static async openDb(): Promise<Database> {
    const database = await open({
      filename: Path.join(__dirname, "database.db"),
      driver: sqlite3.cached.Database
    });

    return database;
  }

  private static async createTables(database: Database): Promise<void> {
    try {
      console.log("Creating DB Tables");
      await database.exec(PRODUCTS_CREATE_SQL);
      await database.exec(ADMIN_CREATE_SQL);
      await database.exec(ADMIN_INIT_DATA);
      await DBManager.insertData(database);
    } catch(e) {
      console.error((e as Error).message);
    }
  }

  private static async insertData(database: Database): Promise<void> {
    const { weapons, ammo } = await parseData();
    const existingProducts = await database.all(`SELECT * FROM ${TableNames.PRODUCTS}`);
    const existingWeapons = existingProducts.filter(p => p.type === 'weapon');
    const existingAmmo = existingProducts.filter(p => p.type === 'ammo');
    
    const newWeapons = weapons.filter(
      weapon => !existingWeapons.some(w => w.id === weapon.id)
    );
    const newAmmo = ammo.filter(
      ammoItem => !existingAmmo.some(a => a.id === ammoItem.id)
    );

    const weaponValues = newWeapons.map(w => `(
      '${w.id}',
      '${w.name.replace("'", "")}',
      'weapon',
      '${w.description.replace("'", "")}',
      '${w.stock}',
      '${w.price}'
    )`);
    const ammoValues = newAmmo.map(a => `(
      '${a.id}',
      '${a.name.replace("'", "")}',
      'ammo',
      '${a.description.replace("'", "")}',
      '${a.stock}',
      '${a.price}'
    )`);

    if (weaponValues.length > 0) {
      console.log(`Inserting ${weaponValues.length} weapons into DB`);
      const insertQuery = `
        INSERT INTO ${TableNames.PRODUCTS}
        VALUES
        ${weaponValues.join(',\n')}
      `;
      
      await database.exec(insertQuery);
    }

    if (ammoValues.length > 0) {
      console.log(`Inserting ${ammoValues.length} ammo items into DB`);
      const insertQuery = `
        INSERT INTO ${TableNames.PRODUCTS}
        VALUES
        ${ammoValues.join(',\n')}
      `;

      await database.exec(insertQuery);
    }
  }

  private async closeDb(): Promise<void> {
    await this.database!.close();
  }

  private formatProduct(result: SourceItem): Product {
    const product: Product = {
      id: result.id,
      name: result.name,
      description: result.description,
      stock: result.stock,
      price: result.price,
    };

    return product;
  }
}


async function parseData(): Promise<SourceData> {
  console.log("Parsing source data");
  const weapons = await parseCsv(WEAPONS_CSV_PATH, parseWeapon);
  const ammo = await parseCsv(AMMO_CSV_PATH, parseAmmo);  
  return {
    weapons: weapons as SourceItem[],
    ammo
  };
}


function parseWeapon(line: string, weapons: SourceItem[]): void {
  parseProduct(line, "weapon", weapons);
}



function parseAmmo(line: string, ammo: SourceItem[]): void {
  parseProduct(line, "ammo", ammo);
}


function parseProduct(line: string, type: string, products: SourceItem[]): void {
  const [
    id,
    name,
    description,
    stock,
    price
  ] = line.split(',').map((cell) => cell?.trim());

  if (!id || !name || !description || !stock || !price) return;

  const sourceItem: SourceItem = {
    id: parseInt(id),
    name,
    type,
    description,
    stock: parseInt(stock),
    price: parseInt(price)
  };

  products.push(sourceItem);
}


async function parseCsv(
  path: PathLike,
  parseValue: (line: string, rows: SourceItem[]) => void
): Promise<SourceItem[]> {
  const rows: SourceItem[] = [];
  try {
    console.log("Parsing csv:", path);
    const data = await fs.readFile(path, "utf8");
    data.split("\n").slice(1).forEach((value: string) => {
      parseValue(value, rows);
    });
  } catch (e) {
    console.error(e);
    throw e;
  }

  return rows;
}
