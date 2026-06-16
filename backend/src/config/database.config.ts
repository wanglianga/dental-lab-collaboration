import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqljs',
  location: path.resolve(__dirname, '../../data/dental-lab.db'),
  autoSave: true,
  entities: [path.resolve(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: true,
  logging: false,
};
