import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tooth, ToothStage, ToothStatus } from './entities/tooth.entity';
import { CreateToothDto, UpdateToothStatusDto } from './dto/create-tooth.dto';
import { ProcessRecord } from '../process-record/entities/process-record.entity';
import { FileRecord } from '../file/entities/file.entity';

@Injectable()
export class ToothService {
  constructor(
    @InjectRepository(Tooth)
    private teethRepository: Repository<Tooth>,
    @InjectRepository(ProcessRecord)
    private processRecordsRepository: Repository<ProcessRecord>,
    @InjectRepository(FileRecord)
    private filesRepository: Repository<FileRecord>,
  ) {}

  async create(createToothDto: CreateToothDto): Promise<Tooth> {
    const tooth = this.teethRepository.create({
      ...createToothDto,
      status: 'pending',
      currentStage: 'model_design',
    });
    return this.teethRepository.save(tooth);
  }

  async findAll(status?: string, orderId?: number): Promise<Tooth[]> {
    const qb = this.teethRepository.createQueryBuilder('tooth')
      .leftJoinAndSelect('tooth.order', 'order')
      .leftJoinAndSelect('order.patient', 'patient')
      .orderBy('tooth.createdAt', 'DESC');

    if (status) {
      qb.where('tooth.status = :status', { status });
    }
    if (orderId) {
      qb.andWhere('tooth.orderId = :orderId', { orderId });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Tooth> {
    const tooth = await this.teethRepository.findOne({
      where: { id },
      relations: ['order', 'order.patient', 'order.doctor', 'processRecords', 'inspections', 'repairs', 'logistics', 'files'],
    });
    if (!tooth) throw new NotFoundException('牙齿不存在');
    return tooth;
  }

  async updateStatus(id: number, dto: UpdateToothStatusDto, operatorId: number): Promise<Tooth> {
    const tooth = await this.findOne(id);
    
    if (dto.stage) {
      tooth.currentStage = dto.stage as ToothStage;
    }
    if (dto.status) {
      tooth.status = dto.status as ToothStatus;
    }

    const processRecord = this.processRecordsRepository.create({
      toothId: tooth.id,
      stage: dto.stage || tooth.currentStage,
      status: dto.status || tooth.status,
      operatorId,
      note: dto.note || '',
    });
    await this.processRecordsRepository.save(processRecord);

    await this.teethRepository.save(tooth);
    return this.findOne(id);
  }

  async update(id: number, dto: Partial<CreateToothDto> & { designFileUrl?: string; scanFileUrl?: string; colorPhotoUrl?: string }): Promise<Tooth> {
    await this.teethRepository.update(id, dto);
    return this.findOne(id);
  }

  async submitTryFeedback(id: number, feedback: string): Promise<Tooth> {
    const tooth = await this.findOne(id);
    tooth.tryFeedback = feedback;
    tooth.status = 'completed';
    await this.teethRepository.save(tooth);
    return this.findOne(id);
  }

  async linkFileToTooth(toothId: number, fileRecordId: number): Promise<Tooth> {
    const tooth = await this.findOne(toothId);
    const fileRecord = await this.filesRepository.findOne({ where: { id: fileRecordId } });
    if (!fileRecord) throw new NotFoundException('文件不存在');

    fileRecord.toothId = toothId;
    fileRecord.orderId = tooth.orderId;
    await this.filesRepository.save(fileRecord);

    if (fileRecord.category === 'color_photo') {
      tooth.colorPhotoUrl = fileRecord.filePath;
    } else if (fileRecord.category === 'scan_file') {
      tooth.scanFileUrl = fileRecord.filePath;
    } else if (fileRecord.category === 'design_file') {
      tooth.designFileUrl = fileRecord.filePath;
    }
    await this.teethRepository.save(tooth);

    return this.findOne(toothId);
  }

  async getToothFiles(toothId: number): Promise<FileRecord[]> {
    return this.filesRepository.find({
      where: { toothId },
      order: { createdAt: 'DESC' },
    });
  }
}
