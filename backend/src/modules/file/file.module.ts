import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { FileRecord } from './entities/file.entity';
import { ToothModule } from '../tooth/tooth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileRecord]),
    MulterModule.register({
      dest: './uploads',
    }),
    forwardRef(() => ToothModule),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
