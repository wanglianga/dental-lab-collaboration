import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class CreateToothInOrderDto {
  @IsNumber()
  toothNumber: number;

  @IsString()
  @IsNotEmpty()
  material: string;

  @IsString()
  @IsNotEmpty()
  shade: string;

  @IsString()
  @IsNotEmpty()
  restorationType: string;

  @IsOptional()
  @IsString()
  requirement?: string;
}

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  patientId: number;

  @IsNumber()
  @IsNotEmpty()
  doctorId: number;

  @IsOptional()
  @IsString()
  clinicalNote?: string;

  @IsOptional()
  @IsString()
  occlusion?: string;

  @IsOptional()
  @IsString()
  designRequirement?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateToothInOrderDto)
  teeth: CreateToothInOrderDto[];
}
