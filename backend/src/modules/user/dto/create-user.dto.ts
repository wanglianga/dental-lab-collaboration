import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../common/decorators/roles.decorator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['doctor', 'receptionist', 'technician', 'inspector', 'logistics'])
  role: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;
}
