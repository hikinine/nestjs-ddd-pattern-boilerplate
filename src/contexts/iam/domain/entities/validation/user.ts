import { Email } from '@app/contexts/shared/domain';
import { V } from '@lib/utils';
import { Auth } from '../auth';
import { Group } from '../group';
import { Permission } from '../permission';
import { Profile } from '../profile';
import { UserProps } from '../user';

export function userValidation(props: UserProps) {
  if (V.notInstanceOf(props.profile, Profile)) {
    return { message: 'Formato inválido para profile' };
  }

  if (V.notInstanceOf(props.email, Email)) {
    return { message: 'Formato inválido para email' };
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
