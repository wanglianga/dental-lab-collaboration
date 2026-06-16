import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { RepairStatus } from '../entities/repair.entity';

export class CreateRepairDto {
  @IsNumber()
  @IsNotEmpty()
  toothId: number;

  @IsNumber()
  @IsNotEmpty()
  reporterId: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsNumber()
  handlerId?: number;

  @IsOptional()
  @IsString()
  repairAction?: string;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'returned'])
  status?: RepairStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}
