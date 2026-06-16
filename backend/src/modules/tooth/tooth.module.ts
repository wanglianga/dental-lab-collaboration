import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToothService } from './tooth.service';
import { ToothController } from './tooth.controller';
import { Tooth } from './entities/tooth.entity';
import { ProcessRecord } from '../process-record/entities/process-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tooth, ProcessRecord])],
  controllers: [ToothController],
  providers: [ToothService],
  exports: [ToothService],
})
export class ToothModule {}
