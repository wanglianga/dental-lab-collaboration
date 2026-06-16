import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { InspectionResult } from '../entities/inspection.entity';

export class CreateInspectionDto {
  @IsNumber()
  @IsNotEmpty()
  toothId: number;

  @IsNumber()
  @IsNotEmpty()
  inspectorId: number;

  @IsBoolean()
  marginPass: boolean;

  @IsBoolean()
  colorPass: boolean;

  @IsBoolean()
  strengthPass: boolean;

  @IsBoolean()
  occlusionPass: boolean;

  @IsEnum(['pass', 'fail', 'rework'])
  result: InspectionResult;

  @IsOptional()
  @IsString()
  marginNote?: string;

  @IsOptional()
  @IsString()
  colorNote?: string;

  @IsOptional()
  @IsString()
  strengthNote?: string;

  @IsOptional()
  @IsString()
  occlusionNote?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
