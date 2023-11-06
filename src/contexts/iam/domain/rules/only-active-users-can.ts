import { User } from '@iam/domain/entities';
import { ForbiddenException } from '@nestjs/common';

export function OnlyActiveUsersCan() {
  return function (
    target: User,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      if (!this.isActive()) {
        throw new ForbiddenException('Usuário inativo.');
      }
      return originalMethod.apply(this, args);
    };
  };
}
