export interface UploadFileOptions {
  key: string;
  buffer: Buffer;
  mimeType: string;
}

export interface StorageGateway {
  upload(options: UploadFileOptions): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
}
