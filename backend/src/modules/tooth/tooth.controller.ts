import { Controller, Get, Post, Body, Param, Put, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ToothService } from './tooth.service';
import { CreateToothDto, UpdateToothStatusDto } from './dto/create-tooth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FileService } from '../file/file.service';
import { extname } from 'path';

@Controller('teeth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ToothController {
  constructor(
    private readonly toothService: ToothService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  create(@Body() createToothDto: CreateToothDto) {
    return this.toothService.create(createToothDto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('orderId') orderId?: string) {
    return this.toothService.findAll(status, orderId ? +orderId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toothService.findOne(+id);
  }

  @Get(':id/files')
  getFiles(@Param('id') id: string) {
    return this.toothService.getToothFiles(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateToothDto) {
    return this.toothService.update(+id, dto);
  }

  @Put(':id/status')
  @Roles('technician', 'inspector', 'doctor', 'receptionist', 'logistics')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateToothStatusDto, @Req() req) {
    return this.toothService.updateStatus(+id, dto, req.user.id);
  }

  @Post(':id/try-feedback')
  @Roles('doctor')
  submitTryFeedback(@Param('id') id: string, @Body('feedback') feedback: string) {
    return this.toothService.submitTryFeedback(+id, feedback);
  }

  @Post(':id/files')
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
  async uploadToothFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const category = (req.body && req.body.category) || 'other';
    const tooth = await this.toothService.findOne(+id);
    const fileRecord = await this.fileService.saveFile(
      file,
      category,
      tooth.id,
      tooth.orderId,
    );
    if (category && ['color_photo', 'scan_file', 'design_file'].includes(category)) {
      await this.toothService.linkFileToTooth(+id, fileRecord.id);
    }
    return fileRecord;
  }

  @Post(':id/link-file')
  @Roles('doctor', 'receptionist', 'technician', 'inspector')
  async linkFile(@Param('id') id: string, @Body('fileRecordId') fileRecordId: number) {
    return this.toothService.linkFileToTooth(+id, fileRecordId);
  }
}
