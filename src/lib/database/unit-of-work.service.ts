import { Transaction } from '@hiki9/rich-domain/dist/core/repository';

export abstract class UnitOfWorkService {
  abstract startTransaction<T>(callback: Transaction<T>): Promise<T>;
  abstract getContext(): any;
  abstract allowTransaction(constructor: any): void;
}
