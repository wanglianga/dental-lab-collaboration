import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairService } from './repair.service';
import { RepairController } from './repair.controller';
import { Repair } from './entities/repair.entity';
import { Tooth } from '../tooth/entities/tooth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Repair, Tooth])],
  controllers: [RepairController],
  providers: [RepairService],
  exports: [RepairService],
})
export class RepairModule {}
