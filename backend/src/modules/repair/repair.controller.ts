import { Controller, Get, Post, Body, Param, Put, Query, UseGuards, Req } from '@nestjs/common';
import { RepairService } from './repair.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('repairs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RepairController {
  constructor(private readonly service: RepairService) {}

  @Post()
  @Roles('doctor', 'inspector', 'technician', 'receptionist')
  create(@Body() dto: CreateRepairDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('toothId') toothId?: string,
    @Query('repairType') repairType?: string,
  ) {
    return this.service.findAll(status, toothId ? +toothId : undefined, repairType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id/technician')
  @Roles('technician')
  technicianHandle(@Param('id') id: string, @Body() dto: CreateRepairDto, @Req() req: any) {
    return this.service.technicianHandle(+id, dto, req.user.id);
  }

  @Put(':id/inspector')
  @Roles('inspector')
  inspectorReview(@Param('id') id: string, @Body() dto: CreateRepairDto, @Req() req: any) {
    return this.service.inspectorReview(+id, dto, req.user.id);
  }

  @Put(':id')
  @Roles('technician', 'inspector')
  update(@Param('id') id: string, @Body() dto: CreateRepairDto) {
    return this.service.update(+id, dto);
  }
}
