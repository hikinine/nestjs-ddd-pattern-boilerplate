import { Domain } from '@hiki9/rich-domain';

export class BRL extends Domain.ValueObject<number> {
  protected static hooks = Domain.VoHooks({
    validation(value) {
      if (typeof value !== 'number') {
        return { message: 'Formato inválido para BRL' };
      }

      if (value < 0) {
        return { message: 'BRL tem que ser maior ou igual a zero.' };
      }
    },
    transformBeforeCreate(value: number) {
      if (value < 2) {
        return Number(value.toFixed(5));
      }
      return Number(value.toFixed(2));
    },
  });

  get formated(): string {
    return this.value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
