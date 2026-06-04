import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "tsyringe";

import { env } from "@/config/env";
import {
  StorageGateway,
  UploadFileOptions,
} from "@/shared/storage/application/gateways/storage.gateway";

import { StorageLifecycle } from "../../contracts/storage-lifecycle";

@injectable()
export class S3StorageGateway implements StorageGateway, StorageLifecycle {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  public constructor() {
    const {
      S3_BUCKET: bucket,
      S3_ACCESS_KEY: accessKey,
      S3_SECRET_KEY: secretKey,
      S3_PUBLIC_URL: publicUrl,
    } = env;

    if (!bucket || !accessKey || !secretKey || !publicUrl) {
      throw new Error(
        "S3 storage requires S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, and S3_PUBLIC_URL.",
      );
    }

    this.bucket = bucket;
    this.publicUrl = env.S3_ENDPOINT ? `${env.S3_ENDPOINT}/${bucket}` : publicUrl;
    this.client = new S3Client({
      region: env.S3_REGION,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      ...(env.S3_ENDPOINT !== undefined && { endpoint: env.S3_ENDPOINT, forcePathStyle: true }),
    });
  }

  public async initialize(): Promise<void> {
    await this.ensureBucketExists();
    await this.client.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: "s3:GetObject",
              Resource: `arn:aws:s3:::${this.bucket}/*`,
            },
          ],
        }),
      }),
    );
  }

  public async upload(options: UploadFileOptions): Promise<{ url: string }> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: options.key,
        Body: options.buffer,
        ContentType: options.mimeType,
      }),
    );

    return { url: `${this.publicUrl}/${options.key}` };
  }

  public getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  public async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  public async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }
}
