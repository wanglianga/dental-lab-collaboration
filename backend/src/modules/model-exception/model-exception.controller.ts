import { Controller, Get, Post, Body, Param, Put, Query, UseGuards, Req } from '@nestjs/common';
import { ModelExceptionService } from './model-exception.service';
import { CreateModelExceptionDto } from './dto/create-model-exception.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('model-exceptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModelExceptionController {
  constructor(private readonly service: ModelExceptionService) {}

  @Post()
  @Roles('technician', 'inspector', 'doctor', 'receptionist')
  create(@Body() dto: CreateModelExceptionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('orderId') orderId?: string,
    @Query('toothId') toothId?: string,
  ) {
    return this.service.findAll(
      status,
      orderId ? +orderId : undefined,
      toothId ? +toothId : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id/notify-patient')
  @Roles('receptionist', 'doctor')
  notifyPatient(@Param('id') id: string, @Body() dto: CreateModelExceptionDto, @Req() req: any) {
    return this.service.notifyPatient(+id, dto, req.user.id);
  }

  @Put(':id/doctor-confirm')
  @Roles('doctor')
  doctorConfirm(@Param('id') id: string, @Body() dto: CreateModelExceptionDto, @Req() req: any) {
    return this.service.doctorConfirm(+id, dto, req.user.id);
  }

  @Put(':id/record-loss')
  @Roles('technician')
  recordLoss(@Param('id') id: string, @Body() dto: CreateModelExceptionDto, @Req() req: any) {
    return this.service.recordLoss(+id, dto, req.user.id);
  }

  @Put(':id/reschedule')
  @Roles('technician', 'receptionist', 'doctor')
  reschedule(@Param('id') id: string, @Body() dto: CreateModelExceptionDto) {
    return this.service.reschedule(+id, dto);
  }

  @Put(':id')
  @Roles('technician', 'inspector', 'doctor', 'receptionist')
  update(@Param('id') id: string, @Body() dto: CreateModelExceptionDto) {
    return this.service.update(+id, dto);
  }
}
