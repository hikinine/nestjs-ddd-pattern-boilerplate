import { Domain } from '@hiki9/rich-domain';
import { z } from 'zod';

export class Phone extends Domain.ValueObject<string> {
  protected static hooks = Domain.VoHooks({
    validation(value) {
      const parser = z.string().regex(/\(\d{2}\)\s\d{4,5}\-\d{4}$/gi);
      if (!parser.safeParse(value).success) {
        return {
          message: `Telefone recebido ${value}. Formato esperado: (XX) XXXXX-XXXX Ou (XX) XXXX-XXXX`,
        };
      }
    },
  });
}
