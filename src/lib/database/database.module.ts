import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUnitOfWorkService } from './unit-of-work.prisma.service';
import { UnitOfWorkService } from './unit-of-work.service';

@Module({
  providers: [
    PrismaService,
    {
      provide: UnitOfWorkService,
      useClass: PrismaUnitOfWorkService,
    },
  ],
  exports: [PrismaService, UnitOfWorkService],
})
export class DatabaseModule {}
