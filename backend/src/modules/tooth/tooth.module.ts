import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToothService } from './tooth.service';
import { ToothController } from './tooth.controller';
import { Tooth } from './entities/tooth.entity';
import { ProcessRecord } from '../process-record/entities/process-record.entity';
import { FileRecord } from '../file/entities/file.entity';
import { FileModule } from '../file/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tooth, ProcessRecord, FileRecord]), forwardRef(() => FileModule)],
  controllers: [ToothController],
  providers: [ToothService],
  exports: [ToothService],
})
export class ToothModule {}
