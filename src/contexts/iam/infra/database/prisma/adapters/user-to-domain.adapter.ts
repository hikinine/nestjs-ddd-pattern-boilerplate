import { Adapter } from '@hiki9/rich-domain';
import { Id } from '@hiki9/rich-domain/dist/core';
import {
  Auth,
  Permission as DomainPermission,
  Group,
  Permission,
  Profile,
  RecoveryPassword,
  RefreshToken,
  User,
} from '@iam/domain/entities';
import { OAuth, Password, Username } from '@iam/domain/value-object';
import { Injectable } from '@nestjs/common';
import { Address, Email, Phone } from '@shared/domain';
import { UserSchema } from '../schema';
import { PermissionsAdapter } from './permission-enum.adapter';

@Injectable()
export class PrismaUserToDomainAdapter extends Adapter<UserSchema, User> {
  public build(data: UserSchema): User {
    return new User({
      id: new Id(data.id),
      email: new Email(data.email),

      profile: new Profile({
        id: new Id(data.profile.userId),
        avatar: data.profile.avatar,
        birthday: data.profile.birthday,
        firstName: new Username(data.profile.firstName),
        lastName: new Username(data.profile.lastName),
        phone: new Phone(data.profile.phone),
        office: data.profile.office,
        gender: data.profile.gender as 'M' | 'F' | 'O',
        address: data.profile.address
          ? new Address({
              city: data.profile.address.city,
              complement: data.profile.address.complement,
              extra: data.profile.address.extra,
              neighborhood: data.profile.address.neighborhood,
              number: data.profile.address.number,
              state: data.profile.address.state,
              street: data.profile.address.street,
              zipCode: data.profile.address.zipCode,
            })
          : null,
      }),
      auth: new Auth({
        password: Password.createFromHash(data?.authentication?.password),
        oauth:
          data?.authentication?.oauth?.map(
            (oauth) =>
              new OAuth({
                externalUserProviderId: oauth.externalUserProviderId,
                provider: oauth.provider,
              }),
          ) || [],
        activeRecoveryPassword:
          data?.authentication?.recoveryPassword?.map(
            (recoveryPassword) =>
              new RecoveryPassword({
                id: new Id(recoveryPassword.token),
                expiresAt: recoveryPassword.expiresAt,
                passwordWasRecovered: recoveryPassword.passwordWasRecovered,
                passwordWasRecoveredAt: recoveryPassword.passwordWasRecoveredAt,
                createdAt: recoveryPassword.createdAt,
              }),
          ) || [],
        refreshToken:
          data?.authentication?.refreshToken?.map(
            (refreshToken) =>
              new RefreshToken({
                id: new Id(refreshToken.id),
                token: refreshToken.token,
                expiresAt: new Date(refreshToken.refreshTokenExpiresAt),
                userAgent: refreshToken.userAgent,
                createdAt: new Date(refreshToken.createdAt),
              }),
          ) || [],
      }),
      isActive: data.isActive,
      groups: data.groupParticipants.map(
        (participant) =>
          new Group({
            id: new Id(participant.groupId),
            name: participant.group.name,
            isDepartment: participant.group.isDepartment,
            createdAt: participant.group.createdAt,
            updatedAt: participant.group.updatedAt,
            permissions:
              participant?.group?.permission?.map?.(
                (permission) =>
                  new Permission({
                    id: new Id(permission.id),
                    automation: PermissionsAdapter.PrismaToDomain(
                      permission.automation,
                    ),
                    create: PermissionsAdapter.PrismaToDomain(
                      permission.create,
                    ),
                    delete: PermissionsAdapter.PrismaToDomain(
                      permission.delete,
                    ),
                    export: PermissionsAdapter.PrismaToDomain(
                      permission.export,
                    ),
                    import: PermissionsAdapter.PrismaToDomain(
                      permission.import,
                    ),
                    read: PermissionsAdapter.PrismaToDomain(permission.read),
                    update: PermissionsAdapter.PrismaToDomain(
                      permission.update,
                    ),
                    manage: PermissionsAdapter.PrismaToDomain(
                      permission.manage,
                    ),
                    createdBy: permission.createdBy,
                    updatedBy: permission.updatedBy,
                    entity: permission.permissionId as any,
                  }),
              ) || [],
          }),
      ),
      permissions: data.permissions.map(
        (permission) =>
          new DomainPermission({
            id: new Id(permission.id),
            automation: PermissionsAdapter.PrismaToDomain(
              permission.automation,
            ),
            create: PermissionsAdapter.PrismaToDomain(permission.create),
            delete: PermissionsAdapter.PrismaToDomain(permission.delete),
            export: PermissionsAdapter.PrismaToDomain(permission.export),
            import: PermissionsAdapter.PrismaToDomain(permission.import),
            read: PermissionsAdapter.PrismaToDomain(permission.read),
            update: PermissionsAdapter.PrismaToDomain(permission.update),
            manage: PermissionsAdapter.PrismaToDomain(permission.manage),
            createdBy: permission.createdBy,
            updatedBy: permission.updatedBy,
            entity: permission.permissionId as any,
          }),
      ),
      entitiesAccessControl: [],

      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
