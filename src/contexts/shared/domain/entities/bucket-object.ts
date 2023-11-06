export class BucketQuery {
  key: string;
  bucket: string;
}

export class BucketObject<T = unknown> {
  headers: {
    contentLength?: number;
    contentType: string;
    contentDisposition?: string;
    lastModified?: Date;
  };

  key: string;
  bucket: string;
  file: Buffer;

  providerResponse: T;

  constructor(props?: {
    bucket: string;
    key: string;
    file: Buffer;
    contentType: string;
  }) {
    if (props) {
      this.headers = {
        contentType: props.contentType,
      };
      this.bucket = props.bucket;
      this.key = props.key;
      this.file = props.file;
    }
  }
}
