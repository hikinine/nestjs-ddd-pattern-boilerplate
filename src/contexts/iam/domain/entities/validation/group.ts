import { V } from '@lib/utils';
import { GroupProps } from '../group';
import { Permission } from '../permission';

export function groupValidation(props: GroupProps) {
  if (V.notTypeOf(props.name, 'string')) {
    return { message: 'Formato inválido para nome' };
  }

  if (V.notTypeOf(props.isDepartment, 'boolean')) {
    return { message: 'Formato inválido para isDepartment' };
  }

  if (V.notArrayOfInstanceOf(props.permissions, Permission)) {
    return { message: 'Formato inválido para permissions' };
  }
}
