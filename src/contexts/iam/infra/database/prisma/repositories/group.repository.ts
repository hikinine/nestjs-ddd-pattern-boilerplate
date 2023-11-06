import { Pagination, PaginationCriteria, Repository } from '@hiki9/rich-domain';
import { WriteOptions } from '@hiki9/rich-domain/dist/core/repository';
import { Group } from '@iam/domain/entities';
import { GroupRepository } from '@iam/domain/repositories';
import {
  PrismaGroupToDomainAdapter,
  PrismaGroupToPersistenceAdapter,
} from '@iam/infra/database/prisma/adapters';
import { GroupSchema } from '@iam/infra/database/prisma/schema/group.schema';
import { PrismaService } from '@lib/common';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaGroupRepository
  extends Repository.Impl<Group>
  implements GroupRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly adapterToDomain: PrismaGroupToDomainAdapter,
    protected readonly adapterToPersistence: PrismaGroupToPersistenceAdapter,
  ) {
    super();
  }

  get model(): Prisma.ModelName {
    return 'group';
  }

  protected getContext(options?: WriteOptions): Prisma.TransactionClient {
    return (options?.context || this.prisma) as Prisma.TransactionClient;
  }

  private findIncludes /**: Prisma.groupFindManyArgs['include'] */ = {
    permission: true,
    participants: {
      include: {
        user: true,
      },
      take: 10,
    },
  };
  private uniqueIncludes /**: Prisma.groupFindUniqueArgs['include']  */ = {
    permission: true,
    participants: {
      include: {
        user: true,
      },
      take: 10,
    },
  };

  async find(criteria: PaginationCriteria): Promise<Pagination<Group>> {
    const query = {} as Prisma.groupFindManyArgs;
    query.skip = criteria.offset;
    query.take = criteria.limit;

    const [models, total] = await Promise.all([
      this.prisma.group.findMany({
        ...query,
        include: this.findIncludes,
      }),
      this.prisma.group.count({ where: query.where }),
    ]);

    const result = (models as GroupSchema[]).map((value) =>
      this.adapterToDomain.build(value),
    );

    const pagination = new Pagination<Group>(criteria, { result, total });
    return pagination;
  }

  public async findById(id: string): Promise<Group | null> {
    const query = {} as Prisma.groupFindUniqueArgs;
    query.where = { id };

    const model = await this.prisma.group.findUnique({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as GroupSchema);
    return domain;
  }

  public async findByName(groupName: string): Promise<Group> {
    const query = {} as Prisma.groupFindUniqueArgs;
    query.where = { name: groupName };

    const model = await this.prisma.group.findUnique({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as GroupSchema);
    return domain;
  }

  public async create(
    entity: Group,
    options?: WriteOptions<Prisma.TransactionClient>,
  ): Promise<void> {
    const context = this.getContext(options);
    const model = this.adapterToPersistence.build(
      entity,
    ) as Prisma.groupCreateArgs['data'];
    const query = await context.group.create({ data: model });

    if (!query) {
      throw query;
    }
  }

  public async update(
    entity: Group,
    options?: WriteOptions<Prisma.TransactionClient>,
  ): Promise<void> {
    const context = this.getContext(options);
    const model = this.adapterToPersistence.build(entity);
    const query = await context.group.update({
      where: { id: entity.id.value },
      data: model,
    });

    if (!query) {
      throw query;
    }
  }

  public async delete(
    group: Group,
    options?: WriteOptions<Prisma.TransactionClient>,
  ): Promise<void> {
    const context = this.getContext(options);
    const query = await context.group.delete({ where: { id: group.id.value } });

    if (!query) {
      throw query;
    }
  }

  public async getPermissionsList(): Promise<string[]> {
    const models = await this.prisma.permission.findMany();
    return models.map((value) => value.id);
  }
}
