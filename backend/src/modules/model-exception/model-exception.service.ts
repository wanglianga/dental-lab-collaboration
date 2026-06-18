import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ModelException } from './entities/model-exception.entity';
import { CreateModelExceptionDto } from './dto/create-model-exception.dto';
import { Tooth } from '../tooth/entities/tooth.entity';
import { Order } from '../order/entities/order.entity';
import { FileRecord } from '../file/entities/file.entity';

@Injectable()
export class ModelExceptionService {
  constructor(
    @InjectRepository(ModelException)
    private modelExceptionsRepository: Repository<ModelException>,
    @InjectRepository(Tooth)
    private teethRepository: Repository<Tooth>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(FileRecord)
    private filesRepository: Repository<FileRecord>,
  ) {}

  async create(dto: CreateModelExceptionDto): Promise<ModelException> {
    const { attachmentIds, ...exceptionData } = dto;
    const exception = this.modelExceptionsRepository.create({
      ...exceptionData,
      status: exceptionData.status || 'reported',
    });
    const saved = await this.modelExceptionsRepository.save(exception);

    if (attachmentIds && attachmentIds.length > 0) {
      await this.filesRepository.update(
        { id: In(attachmentIds) },
        { modelExceptionId: saved.id },
      );
    }

    if (dto.toothId) {
      const tooth = await this.teethRepository.findOne({ where: { id: dto.toothId } });
      if (tooth && tooth.status !== 'completed') {
        tooth.status = 'pending';
        await this.teethRepository.save(tooth);
      }
    }

    return this.findOne(saved.id);
  }

  findAll(status?: string, orderId?: number, toothId?: number): Promise<ModelException[]> {
    const qb = this.modelExceptionsRepository.createQueryBuilder('e')
      .leftJoinAndSelect('e.reporter', 'reporter')
      .leftJoinAndSelect('e.receptionist', 'receptionist')
      .leftJoinAndSelect('e.doctor', 'doctor')
      .leftJoinAndSelect('e.technician', 'technician')
      .leftJoinAndSelect('e.order', 'order')
      .leftJoinAndSelect('e.tooth', 'tooth')
      .leftJoinAndSelect('e.attachments', 'attachments')
      .orderBy('e.createdAt', 'DESC');

    if (status) {
      qb.where('e.status = :status', { status });
    }
    if (orderId) {
      qb.andWhere('e.orderId = :orderId', { orderId });
    }
    if (toothId) {
      qb.andWhere('e.toothId = :toothId', { toothId });
    }

    return qb.getMany();
  }

  findOne(id: number): Promise<ModelException> {
    const exception = this.modelExceptionsRepository.findOne({
      where: { id },
      relations: [
        'reporter',
        'receptionist',
        'doctor',
        'technician',
        'order',
        'order.patient',
        'tooth',
        'attachments',
      ],
    });
    if (!exception) throw new NotFoundException('模型异常记录不存在');
    return exception;
  }

  async notifyPatient(id: number, dto: Partial<CreateModelExceptionDto>, receptionistId: number): Promise<ModelException> {
    const exception = await this.findOne(id);
    if (!exception) throw new NotFoundException('模型异常记录不存在');

    await this.modelExceptionsRepository.update(id, {
      receptionistId,
      patientAction: dto.patientAction,
      patientNotification: dto.patientNotification,
      status: 'doctor_confirming',
    });

    return this.findOne(id);
  }

  async doctorConfirm(id: number, dto: Partial<CreateModelExceptionDto>, doctorId: number): Promise<ModelException> {
    const exception = await this.findOne(id);
    if (!exception) throw new NotFoundException('模型异常记录不存在');

    const updateData: any = {
      doctorId,
      affectsOriginalPlan: dto.affectsOriginalPlan,
      doctorDecision: dto.doctorDecision,
      doctorRemark: dto.doctorRemark,
    };

    if (dto.doctorDecision === 'cancel_tooth' && exception.toothId) {
      const tooth = await this.teethRepository.findOne({ where: { id: exception.toothId } });
      if (tooth) {
        tooth.status = 'completed';
        await this.teethRepository.save(tooth);
      }
      updateData.status = 'closed';
    } else {
      updateData.status = 'recording_loss';
    }

    await this.modelExceptionsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async recordLoss(id: number, dto: Partial<CreateModelExceptionDto>, technicianId: number): Promise<ModelException> {
    const exception = await this.findOne(id);
    if (!exception) throw new NotFoundException('模型异常记录不存在');

    await this.modelExceptionsRepository.update(id, {
      technicianId,
      completedStages: dto.completedStages,
      materialLoss: dto.materialLoss,
      status: 'rescheduling',
    });

    return this.findOne(id);
  }

  async reschedule(id: number, dto: Partial<CreateModelExceptionDto>): Promise<ModelException> {
    const exception = await this.findOne(id);
    if (!exception) throw new NotFoundException('模型异常记录不存在');

    await this.modelExceptionsRepository.update(id, {
      originalDeliveryDate: dto.originalDeliveryDate,
      newDeliveryDate: dto.newDeliveryDate,
      deliveryDateNote: dto.deliveryDateNote,
      status: 'resolved',
    });

    return this.findOne(id);
  }

  async update(id: number, dto: Partial<CreateModelExceptionDto>): Promise<ModelException> {
    await this.modelExceptionsRepository.update(id, dto);
    return this.findOne(id);
  }
}
