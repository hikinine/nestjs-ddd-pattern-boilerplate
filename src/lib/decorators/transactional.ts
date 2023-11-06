import { UnitOfWorkInternalKey } from '@lib/constants';

export function Transactional(serviceName: symbol = UnitOfWorkInternalKey) {
  const errorMessage = `Transactional decorator can only be used in class with ${''} property`;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      if (!this[serviceName]) throw new Error(errorMessage);
      const callback = originalMethod.bind(this, ...args);
      const response = await this[serviceName].startTransaction(callback);
      return response;
    };
    return descriptor;
  };
}
