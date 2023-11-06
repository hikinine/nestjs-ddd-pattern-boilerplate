import { Adapter } from '@hiki9/rich-domain';
import {
  Auth,
  Permission,
  RecoveryPassword,
  RefreshToken,
  User,
} from '@iam/domain/entities';
import { OAuth } from '@iam/domain/value-object';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PermissionsAdapter } from './permission-enum.adapter';

type Props = Partial<Prisma.userCreateArgs['data']> &
  Partial<Prisma.userUpdateArgs['data']>;

@Injectable()
export class PrismaUserToPersistenceAdapter extends Adapter<
  User,
  Prisma.userCreateArgs['data'] | Prisma.userUpdateArgs['data']
> {
  public build(
    user: User,
  ): Prisma.userCreateArgs['data'] | Prisma.userUpdateArgs['data'] {
    const props: Props = this.initProps(user);

    if (user.isNew()) {
      props.authentication.create = this.createAuthentication(user.auth);
      props.permissions.create = this.createPermissions(user.permissions);
      props.groupParticipants.create = user.groups.map((group) => ({
        groupId: group.id.value,
        role: 'guest',
      }));
    } else {
      props.authentication.update = {};

      if (user.history.hasChange('auth')) {
        props.authentication.update.password = user.auth.getPasswordHash();
      }
      if (user.history.hasChange('oauth')) {
        const initialValues = user.history.initialProps.auth.oauth;
        const currentValues = user.auth.oauth;
        const { toCreate, toDelete } = user.history.resolve(
          initialValues,
          currentValues,
        );

        props.authentication.update.oauth = {
          delete: this.deleteOAuth(toDelete),
          create: this.createOAuth(toCreate),
        };
      }
      if (user.history.hasChange('refreshToken')) {
        const initialValues = user.history.initialProps.auth.refreshToken;
        const currentValues = user.auth.refreshToken;
        const { toCreate, toDelete, toUpdate } = user.history.resolve(
          initialValues,
          currentValues,
        );

        props.authentication.update.refreshToken = {
          delete: toDelete.map((refreshToken) => ({
            id: refreshToken.id.value,
          })),

          create: this.createRefreshToken(toCreate),
          update: this.updateRefreshToken(toUpdate),
        };
      }
      if (user.history.hasChange('activeRecoveryPassword')) {
        const initialValues =
          user.history.initialProps.auth.activeRecoveryPassword;
        const currentValues = user.auth.activeRecoveryPassword;
        const { toCreate, toDelete, toUpdate } = user.history.resolve(
          initialValues,
          currentValues,
        );
        props.authentication.update.recoveryPassword = {
          delete: toDelete.map((recoveryPassword) => ({
            token: recoveryPassword.id.value,
          })),
          create: this.createRecoveryPassword(toCreate),
          update: this.updateRecoveryPassword(toUpdate),
        };
      }
      if (user.history.hasChange('groups')) {
        const initialValues = user.history.initialProps.groups;
        const currentValues = user.groups;
        const { toCreate, toDelete } = user.history.resolve(
          initialValues,
          currentValues,
        );

        props.groupParticipants.delete = toDelete.map((group) => ({
          userId_groupId: {
            userId: user.id.value,
            groupId: group.id.value,
          },
        }));
        props.groupParticipants.create = toCreate.map((group) => ({
          groupId: group.id.value,

          role: 'guest',
        }));
      }
      if (user.history.hasChange('permissions')) {
        const initialValues = user.history.initialProps.permissions;
        const currentValues = user.permissions;
        const { toCreate, toDelete, toUpdate } = user.history.resolve(
          initialValues,
          currentValues,
        );

        props.permissions.delete = toDelete.map((permission) => ({
          id: permission.id.value,
        }));

        props.permissions.create = this.createPermissions(toCreate);
        props.permissions.update = this.updatePermissions(toUpdate);
      }
    }
    return props;
  }

  private initProps(user: User): Props {
    return {
      id: user.id.value,
      email: user.email.value,
      phone: user.phone.value,
      office: user.office,
      username: user.username.value,
      isActive: user.active,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
      authentication: {},
      permissions: {},
      groupParticipants: {},
      entitiesAccessControl: {},
    };
  }

  private createOAuth(userOAuths: OAuth[]) {
    return userOAuths.map((oauth) => ({
      externalUserProviderId: oauth.value.externalUserProviderId,
      provider: oauth.value.provider,
    }));
  }
  private deleteOAuth(userOAuths: OAuth[]) {
    return userOAuths.map((oauth) => ({
      externalUserProviderId: oauth.value.externalUserProviderId,
    }));
  }

  private createRecoveryPassword(userRecoveryPasswords: RecoveryPassword[]) {
    return userRecoveryPasswords.map((recoveryPassword) => ({
      token: recoveryPassword.token,
      expiresAt: recoveryPassword.expiresAt,
      createdAt: recoveryPassword.createdAt,
      passwordWasRecovered: recoveryPassword.passwordWasRecovered,
      passwordWasRecoveredAt: recoveryPassword.passwordWasRecoveredAt,
    }));
  }
  private updateRecoveryPassword(userRecoveryPasswords: RecoveryPassword[]) {
    return userRecoveryPasswords.map((recoveryPassword) => ({
      where: {
        token: recoveryPassword.id.value,
      },
      data: {
        expiresAt: recoveryPassword.expiresAt,
        passwordWasRecovered: recoveryPassword.passwordWasRecovered,
        passwordWasRecoveredAt: recoveryPassword.passwordWasRecoveredAt,
        token: recoveryPassword.id.value,
        createdAt: recoveryPassword.createdAt,
      },
    }));
  }
  private createRefreshToken(userRefreshTokens: RefreshToken[]) {
    return userRefreshTokens.map((refreshToken) => ({
      refreshTokenExpiresAt: refreshToken.expiresAt,
      token: refreshToken.token,
      id: refreshToken.id.value,
      userAgent: refreshToken.userAgent,
      createdAt: refreshToken.createdAt,
    }));
  }

  private updateRefreshToken(userRefreshTokens: RefreshToken[]) {
    return userRefreshTokens.map((refreshToken) => ({
      where: {
        id: refreshToken.id.value,
      },
      data: {
        token: refreshToken.token,
        refreshTokenExpiresAt: refreshToken.expiresAt,
        userAgent: refreshToken.userAgent,
        createdAt: refreshToken.createdAt,
      },
    }));
  }

  private createAuthentication(userAuth: Auth) {
    return {
      password: userAuth.getPasswordHash(),

      oauth: {
        create: this.createOAuth(userAuth.oauth),
      },
      recoveryPassword: {
        create: this.createRecoveryPassword(userAuth.activeRecoveryPassword),
      },
      refreshToken: {
        create: this.createRefreshToken(userAuth.refreshToken),
      },
    };
  }

  private updatePermissions(userPermission: Permission[]) {
    return userPermission.map((permission) => ({
      where: {
        id: permission.id.value,
      },
      data: {
        createdBy: permission.createdBy,
        updatedBy: permission.updatedBy,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
        automation: PermissionsAdapter.DomainToPrisma(
          permission.value.automation,
        ),
        export: PermissionsAdapter.DomainToPrisma(permission.value.export),
        import: PermissionsAdapter.DomainToPrisma(permission.value.import),
        update: PermissionsAdapter.DomainToPrisma(permission.value.update),
        delete: PermissionsAdapter.DomainToPrisma(permission.value.delete),
        read: PermissionsAdapter.DomainToPrisma(permission.value.read),
        create: PermissionsAdapter.DomainToPrisma(permission.value.create),
        manage: PermissionsAdapter.DomainToPrisma(permission.value.manage),
      },
    }));
  }
  private createPermissions(userPermission: Permission[]) {
    return userPermission.map((permission) => ({
      id: permission.id.value,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      createdBy: permission.createdBy,
      updatedBy: permission.updatedBy,

      automation: PermissionsAdapter.DomainToPrisma(
        permission.value.automation,
      ),
      export: PermissionsAdapter.DomainToPrisma(permission.value.export),
      import: PermissionsAdapter.DomainToPrisma(permission.value.import),
      update: PermissionsAdapter.DomainToPrisma(permission.value.update),
      delete: PermissionsAdapter.DomainToPrisma(permission.value.delete),
      read: PermissionsAdapter.DomainToPrisma(permission.value.read),
      create: PermissionsAdapter.DomainToPrisma(permission.value.create),
      manage: PermissionsAdapter.DomainToPrisma(permission.value.manage),

      permission: {
        connect: {
          id: permission.entity,
        },
      },
    }));
  }
}
