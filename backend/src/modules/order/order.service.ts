import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Tooth } from '../tooth/entities/tooth.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Tooth)
    private teethRepository: Repository<Tooth>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNo = `ORD${Date.now()}`;
    const { teeth, ...orderData } = createOrderDto;
    const order = this.ordersRepository.create({
      ...orderData,
      orderNo,
      status: 'pending',
    });
    const saved = await this.ordersRepository.save(order);

    for (const toothDto of teeth) {
      const tooth = this.teethRepository.create({
        ...toothDto,
        orderId: saved.id,
        status: 'pending',
        currentStage: 'model_design',
      });
      await this.teethRepository.save(tooth);
    }

    return this.findOne(saved.id);
  }

  async findAll(status?: string, doctorId?: number): Promise<Order[]> {
    const qb = this.ordersRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.patient', 'patient')
      .leftJoinAndSelect('order.doctor', 'doctor')
      .leftJoinAndSelect('order.teeth', 'tooth')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      qb.where('order.status = :status', { status });
    }
    if (doctorId) {
      qb.andWhere('order.doctorId = :doctorId', { doctorId });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'teeth', 'teeth.processRecords', 'teeth.repairs', 'teeth.inspections', 'teeth.logistics', 'teeth.files'],
    });
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  async updateStatus(id: number, status: any): Promise<Order> {
    await this.ordersRepository.update(id, { status } as any);
    return this.findOne(id);
  }

  async update(id: number, dto: Partial<CreateOrderDto>): Promise<Order> {
    await this.ordersRepository.update(id, dto);
    return this.findOne(id);
  }

  async submitTryFeedback(orderId: number, feedback: string): Promise<Order> {
    const order = await this.findOne(orderId);
    order.clinicalNote = (order.clinicalNote || '') + `\n[试戴反馈] ${feedback}`;
    await this.ordersRepository.save(order);
    return order;
  }
}
