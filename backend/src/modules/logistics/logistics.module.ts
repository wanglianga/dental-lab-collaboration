import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { Logistics } from './entities/logistics.entity';
import { Tooth } from '../tooth/entities/tooth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Logistics, Tooth])],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
