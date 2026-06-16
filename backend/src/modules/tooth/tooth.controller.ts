import { Controller, Get, Post, Body, Param, Put, Query, UseGuards, Req } from '@nestjs/common';
import { ToothService } from './tooth.service';
import { CreateToothDto, UpdateToothStatusDto } from './dto/create-tooth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('teeth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ToothController {
  constructor(private readonly toothService: ToothService) {}

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
}
