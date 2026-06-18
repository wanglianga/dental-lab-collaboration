import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { RepairStatus, RepairType, RepairIssue, TechnicianAction } from '../entities/repair.entity';

export class CreateRepairDto {
  @IsOptional()
  @IsEnum(['general', 'try_in'])
  repairType?: RepairType;

  @IsNumber()
  @IsNotEmpty()
  toothId: number;

  @IsNumber()
  @IsNotEmpty()
  reporterId: number;

  @IsOptional()
  @IsEnum(['margin_gap', 'color_gray', 'occlusion_high', 'contact_tight', 'other'])
  issue?: RepairIssue;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsBoolean()
  affectsCharging?: boolean;

  @IsOptional()
  @IsDateString()
  revisitDate?: string;

  @IsOptional()
  @IsArray()
  tryPhotoIds?: number[];

  @IsOptional()
  @IsNumber()
  handlerId?: number;

  @IsOptional()
  @IsEnum(['recolor', 'remake', 'fine_tune', 'reimpression'])
  technicianAction?: TechnicianAction;

  @IsOptional()
  @IsString()
  repairAction?: string;

  @IsOptional()
  @IsNumber()
  inspectorId?: number;

  @IsOptional()
  @IsBoolean()
  inspectionPassed?: boolean;

  @IsOptional()
  @IsString()
  inspectionRemark?: string;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'technician_completed', 'inspecting', 'completed', 'returned'])
  status?: RepairStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}
