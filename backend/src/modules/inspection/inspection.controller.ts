import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InspectionController {
  constructor(private readonly service: InspectionService) {}

  @Post()
  @Roles('inspector', 'technician')
  create(@Body() dto: CreateInspectionDto) {
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
