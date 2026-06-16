import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProcessRecordService } from './process-record.service';
import { CreateProcessRecordDto } from './dto/create-process-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('process-records')
@UseGuards(JwtAuthGuard)
export class ProcessRecordController {
  constructor(private readonly service: ProcessRecordService) {}

  @Post()
  create(@Body() dto: CreateProcessRecordDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('toothId') toothId?: string) {
    return this.service.findAll(toothId ? +toothId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }
}
