import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ItemNotFound } from '@hiki9/rich-domain/dist/core';
import { S3ClientService } from '@lib/provider';
import { Injectable } from '@nestjs/common';
import { BucketObject, BucketQuery } from '@shared/domain/entities';
import { BucketRepository } from '@shared/domain/repositories';
import { BucketToDomainAdapter, BucketToPersistenceAdapter } from '../adapters';

@Injectable()
export class S3BucketRepository implements BucketRepository {
  public constructor(
    private readonly bucketToDomainAdapter: BucketToDomainAdapter,
    private readonly bucketToPersistenceAdapter: BucketToPersistenceAdapter,
    private readonly client: S3ClientService,
  ) {}

  private adaptQuery(query: BucketQuery) {
    return {
      Bucket: query.bucket,
      Key: query.key,
    };
  }

  public async get(props: BucketQuery): Promise<BucketObject> {
    const command = new GetObjectCommand(this.adaptQuery(props));

    const response = await this.client.send(command);
    if (!response) {
      throw new ItemNotFound('BucketObject', props.key);
    }
    return this.bucketToDomainAdapter.build(response);
  }

  public async save(data: BucketObject): Promise<void> {
    const command = this.bucketToPersistenceAdapter.build(data);
    await this.client.send(command);
  }

  public async remove(props: BucketQuery): Promise<void> {
    const command = new DeleteObjectCommand(this.adaptQuery(props));
    await this.client.send(command);
  }
}
