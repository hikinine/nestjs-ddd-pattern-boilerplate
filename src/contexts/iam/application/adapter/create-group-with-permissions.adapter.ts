import { Adapter } from '@hiki9/rich-domain';
import { GroupProps, Permission } from '@iam/domain/entities';
import { CreateGroupWithPermissionsInput } from '@iam/presentation/http/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateGroupWithPermissionsAdapter
  implements Adapter<CreateGroupWithPermissionsInput, GroupProps>
{
  public build(data: CreateGroupWithPermissionsInput): GroupProps {
    const props: GroupProps = {
      isDepartment: data.isDepartment,
      name: data.name,

      permissions: data.permissions.map(
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
      ),
    };
    return props;
  }
}
