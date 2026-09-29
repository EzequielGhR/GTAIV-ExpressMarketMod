import fs from 'fs/promises';
import type { PathLike } from 'fs';
import Path from 'path';
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import { TableNames } from './enums';
import { SourceItem, SourceData } from './types';
import { Product } from '../models/Product';


const DATA_PATH = Path.join(__dirname, "..", "..", "sources");
const WEAPONS_CSV_PATH = Path.join(DATA_PATH, "weapons.csv");

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

  public async getWeaponById(weaponId: number): Promise<Product | null> {
    const result = await this.database.get(`
      SELECT * FROM ${TableNames.PRODUCTS}
      WHERE type = 'weapon'
      AND id = ?
    `, weaponId);

    
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
    `);
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
      await DBManager.insertData(database);
    } catch(e) {
      console.error((e as Error).message);
    }
  }

  private static async insertData(database: Database): Promise<void> {
    const { weapons } = await parseData();
    const existingProducts = await database.all(`SELECT * FROM ${TableNames.PRODUCTS}`);
    const existingWeapons = existingProducts.filter(p => p.type === 'weapon');
    
    const newWeapons = weapons.filter(
      weapon => !existingWeapons.some(w => w.id === weapon.id)
    );

    const weaponValues = newWeapons.map(w => `(
      '${w.id}',
      '${w.name.replace("'", "")}',
      'weapon',
      '${w.description.replace("'", "")}',
      '${w.stock}',
      '${w.price}'
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
  return {
    weapons: weapons as SourceItem[]
  };
}


function parseWeapon(line: string, weapons: SourceItem[]): void {
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
    type: 'weapon',
    description,
    stock: parseInt(stock),
    price: parseInt(price)
  };

  weapons.push(sourceItem);
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
