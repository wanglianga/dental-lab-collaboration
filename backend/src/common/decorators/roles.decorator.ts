import { SetMetadata } from '@nestjs/common';

export type UserRole = 'doctor' | 'receptionist' | 'technician' | 'inspector' | 'logistics';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
