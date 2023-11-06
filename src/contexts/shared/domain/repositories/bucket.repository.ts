import { BucketObject, BucketQuery } from '@shared/domain/entities';

export abstract class BucketRepository {
  abstract save(props: BucketObject): Promise<void>;
  abstract get(props: BucketQuery): Promise<BucketObject>;
  abstract remove(props: BucketQuery): Promise<void>;
}
