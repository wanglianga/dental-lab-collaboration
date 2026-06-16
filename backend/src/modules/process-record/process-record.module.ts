import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessRecordService } from './process-record.service';
import { ProcessRecordController } from './process-record.controller';
import { ProcessRecord } from './entities/process-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessRecord])],
  controllers: [ProcessRecordController],
  providers: [ProcessRecordService],
  exports: [ProcessRecordService],
})
export class ProcessRecordModule {}
