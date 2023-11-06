import {
  PrismaService,
  UnitOfWorkAllowedServices,
  UnitOfWorkInternalKey,
  UnitOfWorkService,
} from '@lib/common';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class PrismaUnitOfWorkService implements UnitOfWorkService {
  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly contextPrisma: PrismaService,
  ) {}

  [UnitOfWorkAllowedServices] = new Array<string>();

  private readonly contextLocalStorage: AsyncLocalStorage<Prisma.TransactionClient> =
    new AsyncLocalStorage();

  public getContext() {
    return this.contextLocalStorage.getStore();
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  async startTransaction<T>(callback: Function): Promise<T> {
    return this.contextPrisma.$transaction(async (context) => {
      return await this.contextLocalStorage.run(context, async () => {
        return await callback();
      });
    });
  }

  public allowTransaction(constructor: any) {
    this[UnitOfWorkAllowedServices].push(constructor.name);
    constructor[UnitOfWorkInternalKey] = this;
  }
}
