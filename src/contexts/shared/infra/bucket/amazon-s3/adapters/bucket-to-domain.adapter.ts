import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Adapter } from '@hiki9/rich-domain';
import { Injectable } from '@nestjs/common';
import { BucketObject } from '@shared/domain/entities';
import { Readable } from 'stream';

@Injectable()
export class BucketToDomainAdapter extends Adapter<
  GetObjectCommandOutput,
  BucketObject
> {
  public async build(data: GetObjectCommandOutput): Promise<BucketObject> {
    const bucket = new BucketObject();

    bucket.headers = {
      contentLength: data.ContentLength,
      contentType: data.ContentType,
      contentDisposition: data.ContentDisposition,
      lastModified: data.LastModified,
    };

    bucket.key = '';
    bucket.bucket = '';
    bucket.file = await this.getBodyAsBuffer(data);
    bucket.providerResponse = data;

    return bucket;
  }

  private async getBodyAsBuffer(response: GetObjectCommandOutput) {
    const getBody = (response: GetObjectCommandOutput) => {
      return response.Body && (response.Body as Readable);
    };

    const stream = getBody(response);
    if (stream) {
      const chunks: Buffer[] = [];
      return new Promise<Buffer>((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    }
  }
}
