import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PatientModule } from './modules/patient/patient.module';
import { OrderModule } from './modules/order/order.module';
import { ToothModule } from './modules/tooth/tooth.module';
import { ProcessRecordModule } from './modules/process-record/process-record.module';
import { InspectionModule } from './modules/inspection/inspection.module';
import { RepairModule } from './modules/repair/repair.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UserModule,
    PatientModule,
    OrderModule,
    ToothModule,
    ProcessRecordModule,
    InspectionModule,
    RepairModule,
    LogisticsModule,
    FileModule,
  ],
})
export class AppModule {}
