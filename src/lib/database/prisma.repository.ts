import { Adapter, Repository } from '@hiki9/rich-domain/dist';
import {
  Aggregate,
  Pagination,
  PaginationCriteria,
  WriteOptions,
} from '@hiki9/rich-domain/dist/core';
import { PrismaService, UnitOfWorkService } from '@lib/database';
import { Prisma } from '@prisma/client';

export abstract class PrismaRepository<
  Domain extends Aggregate<any>,
  Persistence,
> extends Repository.Impl<any> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly adapterToDomain: Adapter<Persistence, Domain>,
    protected readonly adapterToPersistence: Adapter<Domain, any>,
    protected readonly unitOfWorkService: UnitOfWorkService,
  ) {
    super();
  }

  protected abstract findIncludes: any;
  protected abstract uniqueIncludes: any;
  protected abstract generateSearchQuery(search: string): any;

  protected getContext(options?: WriteOptions): PrismaService {
    const unitOfWorkContext = this.unitOfWorkService.getContext();
    return unitOfWorkContext || options?.context || this.prisma;
  }

  async find(criteria: PaginationCriteria): Promise<Pagination<Domain>> {
    const tableName = this.model;
    const context = this.getContext();
    const query = {} as any;
    query.skip = criteria.offset;
    query.take = criteria.limit;

    if (criteria.filter) {
      const OR = criteria.filter.map((filter) => {
        const [field, verb, value] = filter;
        return parseQueryWithDots(field, verb, value);
      });
      query.where = { OR };
    }

    if (criteria.search) {
      query.skip = 0;
      query.where = this.generateSearchQuery(criteria.search);
    }

    if (criteria.orderBy) {
      query.orderBy = criteria.orderBy.map(([field, direction]) => ({
        [field]: direction,
      }));
    }

    const [models, total] = await Promise.all([
      context[tableName as ''].findMany({
        ...query,
        include: this.findIncludes,
      }),
      context[tableName as ''].count({ where: query.where }),
    ]);

    const result = (models as unknown as Persistence[]).map((value) =>
      this.adapterToDomain.build(value),
    );

    const pagination = new Pagination<Domain>(criteria, {
      result,
      total,
    });

    return pagination;
  }

  public async findById(id: string): Promise<Domain | null> {
    const tableName = this.model;
    const context = this.getContext();
    const query = {} as any;
    query.where = { id };

    const model = await context[tableName as ''].findUnique({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as Persistence);
    return domain;
  }

  public async create(
    entity: Domain,
    options?: WriteOptions<Prisma.TransactionClient>,
  ): Promise<void> {
    const tableName = this.model;
    const context = this.getContext(options);
    const model = this.adapterToPersistence.build(entity);
    const query = await context[tableName as ''].create({ data: model });

    if (!query) {
      throw query;
    }
  }

  public async update(
    entity: Domain,
    options?: WriteOptions<Prisma.TransactionClient>,
  ): Promise<void> {
    const tableName = this.model;
    const context = this.getContext(options);
    const model = this.adapterToPersistence.build(entity);
    const query = await context[tableName as ''].update({
      where: { id: entity.id.value },
      data: model,
    });

    if (!query) {
      throw query;
    }
  }

  public async delete(
    entity: Domain,
    options?: WriteOptions<Prisma.TransactionClient>,
  ): Promise<void> {
    const tableName = this.model;
    const context = this.getContext(options);
    const query = await context[tableName as ''].delete({
      where: { id: entity.id.value },
    });

    if (!query) {
      throw query;
    }
  }
}

function parseQueryWithDots(field: string, verb: string, value: any) {
  const fieldMap = field.split('.');
  const m = {};
  fieldMap.reduce((acc, curr, index) => {
    if (index === fieldMap.length - 1) {
      acc[curr] = { [verb]: value };
    } else {
      acc[curr] = {};
    }

    return acc[curr];
  }, m);
  return m;
}
