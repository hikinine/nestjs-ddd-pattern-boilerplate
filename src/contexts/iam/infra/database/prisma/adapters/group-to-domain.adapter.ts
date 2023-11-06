import { Adapter } from '@hiki9/rich-domain';
import { Id } from '@hiki9/rich-domain/dist/core';
import { Group, Permission } from '@iam/domain/entities';
import { Injectable } from '@nestjs/common';
import { GroupSchema } from '../schema/group.schema';
import { PermissionsAdapter } from './permission-enum.adapter';

@Injectable()
export class PrismaGroupToDomainAdapter extends Adapter<GroupSchema, Group> {
  public build(data: GroupSchema): Group {
    return new Group({
      id: new Id(data.id),
      isDepartment: data.isDepartment,
      name: data.name,
      permissions: data.permission.map(
        (permission) =>
          new Permission({
            id: new Id(permission.id),
            manage: PermissionsAdapter.PrismaToDomain(permission.manage),
            import: PermissionsAdapter.PrismaToDomain(permission.import),
            export: PermissionsAdapter.PrismaToDomain(permission.export),
            read: PermissionsAdapter.PrismaToDomain(permission.read),
            create: PermissionsAdapter.PrismaToDomain(permission.create),
            delete: PermissionsAdapter.PrismaToDomain(permission.delete),
            entity: permission.permissionId,
            automation: PermissionsAdapter.PrismaToDomain(
              permission.automation,
            ),
            update: PermissionsAdapter.PrismaToDomain(permission.update),
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt,
            createdBy: permission.createdBy,
            updatedBy: permission.updatedBy,
          }),
      ),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
