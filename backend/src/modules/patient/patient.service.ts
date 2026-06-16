import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientsRepository.create(createPatientDto);
    return this.patientsRepository.save(patient);
  }

  findAll(): Promise<Patient[]> {
    return this.patientsRepository.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number): Promise<Patient> {
    return this.patientsRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: Partial<CreatePatientDto>): Promise<Patient> {
    await this.patientsRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.patientsRepository.delete(id);
  }

  async search(keyword: string): Promise<Patient[]> {
    return this.patientsRepository
      .createQueryBuilder('patient')
      .where('patient.name LIKE :keyword OR patient.phone LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }
}
