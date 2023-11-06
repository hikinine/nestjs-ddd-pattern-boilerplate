import { Domain } from '@hiki9/rich-domain/dist';
import {
  Permission,
  PermissionBitmap,
  PermissionEnum,
  User,
} from '@iam/domain/entities';
import { ForbiddenException } from '@nestjs/common';

export interface AuthorUserContext {
  author: Author;
  userAgent?: string;
}

export interface AuthorProps {
  id: string;
  exp: number;
  permissions: string[];
}
export class Author {
  id: string;
  exp: number;
  permissions: string[];

  constructor(user: AuthorProps) {
    this.id = user.id;
    this.exp = user.exp;
    this.permissions = user.permissions;
  }

  public isTheSameAs(user: User) {
    return this.id === user.id.value;
  }

  public parsePermissions(): Permission[] {
    return this.permissions.map((permission) =>
      Permission.createFromBitmap(permission as PermissionBitmap),
    );
  }

  public created(aggregate: Domain.Aggregate<any> | Domain.Entity<any>) {
    return aggregate.setAuthor(this.id);
  }

  hasPermissions(rawPermissions: string[]) {
    return rawPermissions.every((rawPermission) =>
      this.hasPermission(rawPermission),
    );
  }
  hasPermission(rawPermission: string) {
    const permissions = this.parsePermissions();
    const [entity, method] = rawPermission.split(':');
    const registryController = {
      someRegistry: false,
      somePermission: false,
    };

    const userHasPermission = permissions.some((permission) => {
      const hasRegistry = permission.entity === entity;
      if (hasRegistry) registryController.someRegistry = true;

      const hasPermission = permissions.some((permission) => {
        const acesso = permission.value[method];
        if (acesso === PermissionEnum.AcessoNegado) {
          return false;
        }
        if (
          [
            PermissionEnum.AcessoPessoal,
            PermissionEnum.AcessoGrupo,
            PermissionEnum.AcessoTotal,
          ].includes(acesso)
        ) {
          registryController.somePermission = true;
          return true;
        }
        return false;
      });

      return hasRegistry && hasPermission;
    });

    if (!registryController.someRegistry) {
      throw new ForbiddenException(
        `Acesso negado - é necessário acesso ao módulo ('${entity}').`,
      );
    }
    return userHasPermission;
  }
}
