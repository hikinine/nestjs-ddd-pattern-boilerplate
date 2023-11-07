import { Pagination, PaginationCriteria, Repository } from '@hiki9/rich-domain';
import { WriteOptions } from '@hiki9/rich-domain/dist/core/repository';
import { User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import {
  PrismaUserToDomainAdapter,
  PrismaUserToPersistenceAdapter,
} from '@iam/infra/database/prisma/adapters';
import { UserSchema } from '@iam/infra/database/prisma/schema/user.schema';
import { PrismaService, UnitOfWorkService } from '@lib/common';
import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaUserRepository
  extends Repository.Impl<User>
  implements UserRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly adapterToDomain: PrismaUserToDomainAdapter,
    protected readonly adapterToPersistence: PrismaUserToPersistenceAdapter,
    protected readonly unitOfWorkService: UnitOfWorkService,
  ) {
    super();
  }

  get model(): Prisma.ModelName {
    return 'user';
  }

  protected getContext(options?: WriteOptions): Prisma.TransactionClient {
    const unitOfWorkContext = this.unitOfWorkService.getContext();
    return unitOfWorkContext || options?.context || this.prisma;
  }

  private findIncludes: Prisma.userFindManyArgs['include'] = {
    profile: {
      include: {
        address: true,
      },
    },
    groupParticipants: {
      include: {
        group: true,
      },
    },
    permissions: true,
    entitiesAccessControl: true,
    authentication: true,
  };

  private uniqueIncludes: Prisma.userFindUniqueArgs['include'] = {
    profile: {
      include: {
        address: true,
      },
    },
    groupParticipants: {
      include: {
        group: {
          include: {
            permission: true,
          },
        },
      },
    },
    permissions: true,
    entitiesAccessControl: true,
    authentication: {
      include: {
        refreshToken: true,
        recoveryPassword: true,
      },
    },
  };

  async find(criteria: PaginationCriteria): Promise<Pagination<User>> {
    const context = this.getContext();
    const query = {} as Prisma.userFindManyArgs;
    query.skip = criteria.offset;
    query.take = criteria.limit;

    if (criteria.search) {
      query.skip = 0;
      query.take = 20;
      query.where = this.generateUserSearchQuery(criteria.search);
    }

    const [models, total] = await Promise.all([
      context.user.findMany({
        ...query,
        include: this.findIncludes,
      }),
      context.user.count({ where: query.where }),
    ]);

    const result = (models as unknown as UserSchema[]).map((value) =>
      this.adapterToDomain.build(value),
    );

    const pagination = new Pagination<User>(criteria, { result, total });
    return pagination;
  }

  public async findByRecoveryToken(token: string): Promise<User> {
    const context = this.getContext();
    const query = {} as Prisma.userFindFirstArgs;
    query.where = {
      authentication: {
        recoveryPassword: {
          some: {
            token,
          },
        },
      },
    };

    const model = await context.user.findFirst({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as UserSchema);
    return domain;
  }
  public async findByEmail(email: string): Promise<User> {
    const context = this.getContext();
    const query = {} as Prisma.userFindFirstArgs;
    query.where = { email };

    const model = await context.user.findFirst({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as UserSchema);
    return domain;
  }
  public async findById(id: string): Promise<User | null> {
    const context = this.getContext();
    const query = {} as Prisma.userFindUniqueArgs;
    query.where = { id };

    const model = await context.user.findUnique({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as UserSchema);
    return domain;
  }

  public async findByRefreshToken(token: string): Promise<User | null> {
    const context = this.getContext();
    const query = {} as Prisma.userFindFirstArgs;
    query.where = {
      authentication: {
        refreshToken: {
          some: {
            token,
          },
        },
      },
    };

    const model = await context.user.findFirst({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as UserSchema);
    return domain;
  }

  public async findByOAuthUserId(
    externalUserProviderId: string,
  ): Promise<User> {
    const context = this.getContext();
    const query = {} as Prisma.userFindFirstArgs;
    query.where = {
      authentication: {
        oauth: {
          some: {
            externalUserProviderId,
          },
        },
      },
    };

    const model = await context.user.findFirst({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as UserSchema);
    return domain;
  }

  public async create(
    entity: User,
    options?: WriteOptions<Prisma.TransactionClient>,
  ): Promise<void> {
    const context = this.getContext(options);
    const model = this.adapterToPersistence.build(
      entity,
    ) as Prisma.userCreateArgs['data'];
    const query = await context.user.create({ data: model });

    if (!query) {
      throw query;
    }
  }

  public async update(
    entity: User,
    options?: WriteOptions<Prisma.TransactionClient>,
  ): Promise<void> {
    const context = this.getContext(options);
    const model = this.adapterToPersistence.build(entity);
    const query = await context.user.update({
      where: { id: entity.id.value },
      data: model,
    });

    if (!query) {
      throw query;
    }
  }

  public async delete(
    user: User,
    options?: WriteOptions<Prisma.TransactionClient>,
  ): Promise<void> {
    const context = this.getContext(options);
    const query = await context.user.delete({ where: { id: user.id.value } });

    if (!query) {
      throw query;
    }
  }

  public async removeUserAccess(
    user: User,
    options?: Repository.WriteOptions,
  ): Promise<void> {
    user;
    options;
    throw new MethodNotAllowedException();
  }

  public async restoreUserAccess(
    user: User,
    options?: Repository.WriteOptions,
  ): Promise<void> {
    user;
    options;
    throw new MethodNotAllowedException();
  }

  private generateUserSearchQuery(search: string): Prisma.userWhereInput {
    const containsSearch = {
      contains: search.toLowerCase(),
      mode: 'insensitive',
    } as const;

    return {
      OR: [
        { id: containsSearch },
        { email: containsSearch },
        {
          profile: {
            OR: [
              { phone: containsSearch },
              { firstName: containsSearch },
              { lastName: containsSearch },
              { office: containsSearch },
            ],
          },
        },
        {
          groupParticipants: {
            some: {
              group: { name: containsSearch },
            },
          },
        },
      ],
    };
  }
}
