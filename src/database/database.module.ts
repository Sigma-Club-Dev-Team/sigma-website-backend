import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { baseDataSourceOptions } from '../config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...baseDataSourceOptions,
      autoLoadEntities: true,
    }),
  ],
})
export class DatabaseModule {}
