import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Adapter } from '@hiki9/rich-domain';
import { Injectable } from '@nestjs/common';
import { BucketObject, BucketQuery } from '@shared/domain/entities';

@Injectable()
export class BucketToPersistenceAdapter extends Adapter<
  BucketQuery,
  PutObjectCommand
> {
  public build(data: BucketObject): PutObjectCommand {
    return new PutObjectCommand({
      Bucket: data.bucket,
      Key: data.key,
      Body: data.file,
      ContentType: data.headers.contentType,
      ContentDisposition: `inline; filename=docs`,
    });
  }
}
