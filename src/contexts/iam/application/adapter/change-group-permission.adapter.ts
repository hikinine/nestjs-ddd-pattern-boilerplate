import { Adapter } from '@hiki9/rich-domain';
import { GroupProps, Permission } from '@iam/domain/entities';
import { ChangeGroupPermissionInput } from '@iam/presentation/http/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChangeGroupPermissionAdapter
  implements Adapter<ChangeGroupPermissionInput, Partial<GroupProps>>
{
  public build(data: ChangeGroupPermissionInput): Partial<GroupProps> {
    const props = {} as GroupProps;

    if (data.name) {
      props.name = data.name;
    }

    if (typeof data.isDepartment === 'boolean') {
      props.isDepartment = data.isDepartment;
    }

    if (data.permissions) {
      props.permissions = data.permissions.map(
        (permission) =>
          new Permission({
            entity: permission.entity,
            manage: permission.manage,
            automation: permission.automation,
            create: permission.create,
            delete: permission.delete,
            read: permission.read,
            update: permission.update,
            export: permission._export,
            import: permission.import,
          }),
      );
    }

    return props;
  }
}
