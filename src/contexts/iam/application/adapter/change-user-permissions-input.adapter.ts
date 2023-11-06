import { Adapter } from '@hiki9/rich-domain';
import { Permission } from '@iam/domain/entities';
import { ChangeUserPermissionsInput } from '@iam/presentation/http/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChangeUserPermissionsInputAdapter
  implements Adapter<ChangeUserPermissionsInput, Permission[]>
{
  public build(data: ChangeUserPermissionsInput): Permission[] {
    const permissions = data.permissions.map(
      (permission) => new Permission(permission),
    );
    return permissions;
  }
}
