import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateToothDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsNumber()
  @IsNotEmpty()
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

export class UpdateToothStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
