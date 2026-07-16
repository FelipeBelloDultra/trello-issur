import { Readable } from "node:stream";

import busboy from "busboy";
import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";

import { Middleware } from "../contracts/middleware";
import { HttpException } from "../http-exception";

export interface UploadedFile {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  size: number;
}

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface FileUploadOptions {
  fieldName: string;
  maxSizeBytes?: number;
  allowedMimeTypes: string[];
}

type FileStream = Readable & { truncated?: boolean };

interface CollectContext {
  options: FileUploadOptions;
  req: Request;
  reject: (err: unknown) => void;
}

@injectable()
export class FileUploadMiddleware implements Middleware<FileUploadOptions> {
  public handle(options: FileUploadOptions) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const contentType = req.headers["content-type"] ?? "";
      if (!contentType.includes("multipart/form-data")) {
        throw new HttpException({
          statusCode: 400,
          message: "Expected multipart/form-data request.",
        });
      }
      await this.parseMultipart(req, options);
      next();
    };
  }

  private parseMultipart(req: Request, options: FileUploadOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const bb = busboy({
        headers: req.headers,
        limits: { fileSize: options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES, files: 1 },
      });

      bb.on("file", (fieldName, stream, info) => {
        if (fieldName !== options.fieldName) {
          stream.resume();
          return;
        }
        this.collectFile(stream, info, { options, req, reject });
      });

      bb.on("close", resolve);
      bb.on("error", (err: unknown) =>
        reject(
          new HttpException({
            statusCode: 400,
            message: err instanceof Error ? err.message : "Upload error.",
          }),
        ),
      );
      req.pipe(bb);
    });
  }

  private collectFile(stream: FileStream, info: busboy.FileInfo, ctx: CollectContext): void {
    if (!ctx.options.allowedMimeTypes.includes(info.mimeType)) {
      stream.destroy();
      ctx.reject(
        new HttpException({
          statusCode: 415,
          message: `Unsupported file type. Allowed: ${ctx.options.allowedMimeTypes.join(", ")}.`,
        }),
      );
      return;
    }

    const chunks: Buffer[] = [];

    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("limit", () => {
      stream.destroy();
      ctx.reject(
        new HttpException({
          statusCode: 413,
          message: `File exceeds the maximum allowed size of ${ctx.options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES} bytes.`,
        }),
      );
    });
    stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      ctx.req.uploadedFile = {
        buffer,
        mimeType: info.mimeType,
        originalName: info.filename,
        size: buffer.length,
      };
    });
  }
}
