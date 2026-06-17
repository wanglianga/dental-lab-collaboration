import { Controller, Post, Get, Param, Delete, UseInterceptors, UploadedFile, Body, Query, UseGuards, Req, Inject, forwardRef } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { extname } from 'path';
import { ToothService } from '../tooth/tooth.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @Inject(forwardRef(() => ToothService))
    private readonly toothService: ToothService,
  ) {}

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
    @Req() req: any,
  ) {
    const body = req.body || {};
    const category = body.category;
    const toothId = body.toothId ? +body.toothId : undefined;
    const orderId = body.orderId ? +body.orderId : undefined;
    const fileRecord = await this.fileService.saveFile(file, category, toothId, orderId);
    if (toothId && category && ['color_photo', 'scan_file', 'design_file'].includes(category)) {
      await this.toothService.linkFileToTooth(toothId, fileRecord.id);
    }
    return fileRecord;
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
  async remove(@Param('id') id: string) {
    const file = await this.fileService.findOne(+id);
    const result = this.fileService.remove(+id);
    if (file && file.toothId && file.category && ['color_photo', 'scan_file', 'design_file'].includes(file.category)) {
      try {
        const tooth = await this.toothService.findOne(file.toothId);
        if (tooth) {
          let changed = false;
          if (file.filePath === tooth.colorPhotoUrl) {
            tooth.colorPhotoUrl = null;
            changed = true;
          }
          if (file.filePath === tooth.scanFileUrl) {
            tooth.scanFileUrl = null;
            changed = true;
          }
          if (file.filePath === tooth.designFileUrl) {
            tooth.designFileUrl = null;
            changed = true;
          }
          if (changed) {
            await this.toothService.update(tooth.id, {
              colorPhotoUrl: tooth.colorPhotoUrl,
              scanFileUrl: tooth.scanFileUrl,
              designFileUrl: tooth.designFileUrl,
            });
          }
        }
      } catch (e) {
        // ignore tooth update errors on file delete
      }
    }
    return result;
  }
}
