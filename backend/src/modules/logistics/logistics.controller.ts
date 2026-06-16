import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { CreateLogisticsDto } from './dto/create-logistics.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogisticsController {
  constructor(private readonly service: LogisticsService) {}

  @Post()
  @Roles('logistics', 'receptionist')
  create(@Body() dto: CreateLogisticsDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('toothId') toothId?: string, @Query('type') type?: string) {
    return this.service.findAll(toothId ? +toothId : undefined, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }
}
