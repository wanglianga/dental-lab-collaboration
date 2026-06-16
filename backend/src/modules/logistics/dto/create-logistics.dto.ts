import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { LogisticsType } from '../entities/logistics.entity';

export class CreateLogisticsDto {
  @IsNumber()
  @IsNotEmpty()
  toothId: number;

  @IsEnum(['ship', 'deliver', 'return'])
  type: LogisticsType;

  @IsNumber()
  @IsNotEmpty()
  operatorId: number;

  @IsOptional()
  @IsString()
  trackingNo?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  receiver?: string;

  @IsOptional()
  @IsString()
  receiverPhone?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
