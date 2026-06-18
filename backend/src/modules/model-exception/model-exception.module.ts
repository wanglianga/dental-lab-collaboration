import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelExceptionService } from './model-exception.service';
import { ModelExceptionController } from './model-exception.controller';
import { ModelException } from './entities/model-exception.entity';
import { Tooth } from '../tooth/entities/tooth.entity';
import { Order } from '../order/entities/order.entity';
import { FileRecord } from '../file/entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModelException, Tooth, Order, FileRecord])],
  controllers: [ModelExceptionController],
  providers: [ModelExceptionService],
  exports: [ModelExceptionService],
})
export class ModelExceptionModule {}
