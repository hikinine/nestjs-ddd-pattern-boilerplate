import { Adapter } from '@hiki9/rich-domain';
import { Group } from '@iam/domain/entities';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PermissionsAdapter } from './permission-enum.adapter';

type Props = Prisma.groupCreateArgs['data'] & Prisma.groupUpdateArgs['data'];
@Injectable()
export class PrismaGroupToPersistenceAdapter extends Adapter<
  Group,
  Prisma.groupCreateArgs['data'] | Prisma.groupUpdateArgs['data']
> {
  public build(
    group: Group,
  ): Prisma.groupCreateArgs['data'] | Prisma.groupUpdateArgs['data'] {
    const props: Props = {
      id: group.id.value,
      isDepartment: group.isDepartment,
      name: group.name,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      createdBy: group.createdBy,
      updatedBy: group.updatedBy,
      permission: {},
    };

    if (group.isNew()) {
      this.createPermissions(props, group);
    } else {
      if (group.history.hasChange('permissions')) {
        props.permission.deleteMany = {};
        this.createPermissions(props, group);
      }
    }
    return props;
  }

  private createPermissions(props: Props, group: Group) {
    props.permission.create = group.permissions.map((permission) => ({
      id: permission.id.value,

      permissionId: permission.entity,
      updatedAt: permission.updatedAt,
      createdAt: permission.createdAt,
      manage: PermissionsAdapter.DomainToPrisma(permission.value.manage),
      read: PermissionsAdapter.DomainToPrisma(permission.value.read),
      update: PermissionsAdapter.DomainToPrisma(permission.value.update),
      automation: PermissionsAdapter.DomainToPrisma(
        permission.value.automation,
      ),
      create: PermissionsAdapter.DomainToPrisma(permission.value.create),
      delete: PermissionsAdapter.DomainToPrisma(permission.value.delete),
      export: PermissionsAdapter.DomainToPrisma(permission.value.export),
      import: PermissionsAdapter.DomainToPrisma(permission.value.import),
      createdBy: permission.createdBy,
      updatedBy: permission.updatedBy,
    }));
  }
}
