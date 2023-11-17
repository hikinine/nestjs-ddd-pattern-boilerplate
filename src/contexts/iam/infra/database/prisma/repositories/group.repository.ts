import { Group } from '@iam/domain/entities';
import { GroupRepository } from '@iam/domain/repositories';
import {
  PrismaGroupToDomainAdapter,
  PrismaGroupToPersistenceAdapter,
} from '@iam/infra/database/prisma/adapters';
import { GroupSchema } from '@iam/infra/database/prisma/schema/group.schema';
import {
  PrismaRepository,
  PrismaService,
  UnitOfWorkService,
} from '@lib/common';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaGroupRepository
  extends PrismaRepository<Group, GroupSchema>
  implements GroupRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly adapterToDomain: PrismaGroupToDomainAdapter,
    protected readonly adapterToPersistence: PrismaGroupToPersistenceAdapter,
    protected readonly unitOfWorkService: UnitOfWorkService,
  ) {
    super(prisma, adapterToDomain, adapterToPersistence, unitOfWorkService);
  }

  get model(): Prisma.ModelName {
    return 'group';
  }

  protected generateSearchQuery(search: string): Prisma.groupWhereInput {
    const containsSearch = {
      contains: search.toLowerCase(),
      mode: 'insensitive',
    } as const;

    return {
      OR: [
        { id: containsSearch },
        { name: containsSearch },
        {
          description: containsSearch,
        },
        {
          participants: {
            some: {
              user: {
                OR: [
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
                ],
              },
            },
          },
        },
      ],
    };
  }

  protected findIncludes /**: Prisma.groupFindManyArgs['include'] */ = {
    permission: true,
    participants: {
      include: {
        user: true,
      },
      take: 10,
    },
  };

  protected uniqueIncludes /**: Prisma.groupFindUniqueArgs['include']  */ = {
    permission: true,
    participants: {
      include: {
        user: true,
      },
      take: 10,
    },
  };

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

  public async getPermissionsList(): Promise<string[]> {
    const models = await this.prisma.permission.findMany();
    return models.map((value) => value.id);
  }
}
