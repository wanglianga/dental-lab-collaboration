import { Controller, Post, Get, Param, Delete, UseInterceptors, UploadedFile, Body, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { extname } from 'path';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category?: string,
    @Body('toothId') toothId?: string,
    @Body('orderId') orderId?: string,
  ) {
    return this.fileService.saveFile(
      file,
      category,
      toothId ? +toothId : undefined,
      orderId ? +orderId : undefined,
    );
  }

  @Get()
  findAll(@Query('toothId') toothId?: string, @Query('orderId') orderId?: string) {
    return this.fileService.findAll(toothId ? +toothId : undefined, orderId ? +orderId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }
}
