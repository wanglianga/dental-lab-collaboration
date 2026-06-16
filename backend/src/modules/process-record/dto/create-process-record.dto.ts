import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateProcessRecordDto {
  @IsNumber()
  @IsNotEmpty()
  toothId: number;

  @IsString()
  @IsNotEmpty()
  stage: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsNotEmpty()
  operatorId: number;

  @IsOptional()
  @IsString()
  note?: string;
}
