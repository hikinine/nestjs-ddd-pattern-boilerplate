import { Email, Phone } from '@app/contexts/shared/domain';
import { Username } from '@iam/domain/value-object';
import { V } from '@lib/utils';
import { Auth } from '../auth';
import { Group } from '../group';
import { Permission } from '../permission';
import { UserProps } from '../user';

export function userValidation(props: UserProps) {
  if (V.notInstanceOf(props.username, Username)) {
    return { message: 'Formato inválido para username' };
  }

  if (V.notTypeOf(props.office, 'string')) {
    return { message: 'Formato inválido para office' };
  }

  if (V.notInstanceOf(props.email, Email)) {
    return { message: 'Formato inválido para email' };
  }

  if (V.notInstanceOf(props.phone, Phone)) {
    return { message: 'Formato inválido para phone' };
  }

  if (V.notInstanceOf(props.auth, Auth)) {
    return { message: 'Formato inválido para auth' };
  }

  if (V.notArrayOfInstanceOf(props.groups, Group)) {
    return { message: 'Formato inválido para groups' };
  }

  if (V.notArrayOfInstanceOf(props.permissions, Permission)) {
    return { message: 'Formato inválido para permissions' };
  }

  if (V.notArrayOfPrimitive(props.entitiesAccessControl || [], 'string')) {
    return { message: 'Formato inválido para entitiesAccessControl' };
  }

  if (V.notTypeOf(props.isActive, 'boolean')) {
    return { message: 'Formato inválido para isActive' };
  }
}
