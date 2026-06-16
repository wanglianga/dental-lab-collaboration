import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.usersRepository.count();
    if (count === 0) {
      const defaultUsers = [
        { username: 'admin', password: 'admin123', name: '系统管理员', role: 'doctor' as const },
        { username: 'doctor1', password: 'doctor123', name: '张医生', role: 'doctor' as const },
        { username: 'reception1', password: 'reception123', name: '李前台', role: 'receptionist' as const },
        { username: 'tech1', password: 'tech123', name: '王技师', role: 'technician' as const },
        { username: 'inspector1', password: 'inspector123', name: '赵质检', role: 'inspector' as const },
        { username: 'logistics1', password: 'logistics123', name: '孙物流', role: 'logistics' as const },
      ];
      for (const u of defaultUsers) {
        const hashed = await bcrypt.hash(u.password, 10);
        await this.usersRepository.save({ ...u, password: hashed });
      }
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const saved = await this.usersRepository.save(user);
    delete saved.password;
    return saved;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return users.map(u => {
      delete u.password;
      return u;
    });
  }
}
