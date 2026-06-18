import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, IsDateString, IsArray } from 'class-validator';
import {
  ModelExceptionStatus,
  ModelExceptionType,
  PatientAction,
  DoctorDecision,
} from '../entities/model-exception.entity';

export class CreateModelExceptionDto {
  @IsEnum(['scan_file_corrupted', 'plaster_model_damaged', 'shade_photo_missing', 'other'])
  @IsNotEmpty()
  exceptionType: ModelExceptionType;

  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsNumber()
  toothId?: number;

  @IsNumber()
  @IsNotEmpty()
  reporterId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  attachmentIds?: number[];

  @IsOptional()
  @IsNumber()
  receptionistId?: number;

  @IsOptional()
  @IsEnum(['retake_photo', 'reimpression', 'reschedule'])
  patientAction?: PatientAction;

  @IsOptional()
  @IsString()
  patientNotification?: string;

  @IsOptional()
  @IsNumber()
  doctorId?: number;

  @IsOptional()
  @IsBoolean()
  affectsOriginalPlan?: boolean;

  @IsOptional()
  @IsEnum(['no_change', 'adjust_plan', 'cancel_tooth'])
  doctorDecision?: DoctorDecision;

  @IsOptional()
  @IsString()
  doctorRemark?: string;

  @IsOptional()
  @IsNumber()
  technicianId?: number;

  @IsOptional()
  @IsString()
  completedStages?: string;

  @IsOptional()
  @IsString()
  materialLoss?: string;

  @IsOptional()
  @IsDateString()
  originalDeliveryDate?: string;

  @IsOptional()
  @IsDateString()
  newDeliveryDate?: string;

  @IsOptional()
  @IsString()
  deliveryDateNote?: string;

  @IsOptional()
  @IsEnum([
    'reported',
    'notifying_patient',
    'doctor_confirming',
    'recording_loss',
    'rescheduling',
    'resolved',
    'closed',
  ])
  status?: ModelExceptionStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}
