import { PermissionEnum as DomainPermission } from '@iam/domain/entities';
import { Permissions as PrismaPermission } from '@prisma/client';

export class PermissionsAdapter {
  static DomainToPrisma(value: DomainPermission): PrismaPermission {
    if (value === DomainPermission.AcessoNegado) {
      return PrismaPermission.AcessoNegado;
    }
    if (value === DomainPermission.AcessoGrupo) {
      return PrismaPermission.PessoalEGrupo;
    }
    if (value === DomainPermission.AcessoTotal) {
      return PrismaPermission.Total;
    }
    if (value === DomainPermission.AcessoPessoal) {
      return PrismaPermission.Pessoal;
    }

    throw new Error('Invalid permission value');
  }

  static PrismaToDomain(value: PrismaPermission): DomainPermission {
    if (value === PrismaPermission.AcessoNegado) {
      return DomainPermission.AcessoNegado;
    }
    if (value === PrismaPermission.Pessoal) {
      return DomainPermission.AcessoPessoal;
    }
    if (value === PrismaPermission.PessoalEGrupo) {
      return DomainPermission.AcessoGrupo;
    }
    if (value === PrismaPermission.Total) {
      return DomainPermission.AcessoTotal;
    }
    throw new Error('Invalid permission value');
  }
}
