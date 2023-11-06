import { Domain } from '@hiki9/rich-domain/dist';
import { V } from '@lib/utils';

export interface AddressProps {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  extra?: string;
  zipCode?: string;
}

export class Address extends Domain.ValueObject<AddressProps> {
  protected static hooks = Domain.VoHooks<AddressProps>({
    validation,
  });
}

function validation(props: AddressProps) {
  if (V.notTypeOfOrNullable(props.street, 'string')) {
    return { message: 'Formato inválido para street' };
  }

  if (V.notTypeOfOrNullable(props.number, 'string')) {
    return { message: 'Formato inválido para number' };
  }

  if (V.notTypeOfOrNullable(props.complement, 'string')) {
    return { message: 'Formato inválido para complement' };
  }

  if (V.notTypeOfOrNullable(props.neighborhood, 'string')) {
    return { message: 'Formato inválido para neighborhood' };
  }

  if (V.notTypeOfOrNullable(props.city, 'string')) {
    return { message: 'Formato inválido para city' };
  }

  if (V.notTypeOfOrNullable(props.state, 'string')) {
    return { message: 'Formato inválido para state' };
  }

  if (V.notTypeOfOrNullable(props.zipCode, 'string')) {
    return { message: 'Formato inválido para zipCode' };
  }
}
