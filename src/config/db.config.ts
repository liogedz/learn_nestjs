import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import * as path from 'path';

export default (): PostgresConnectionOptions => ({
  url: process.env.url,
  type: 'postgres',
  port: Number(process.env.port),
  entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'], //will find all entities in the entities folder
  synchronize: true,
});
