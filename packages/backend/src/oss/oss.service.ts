import { Inject, Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
@Injectable()
export class OssService {
  @Inject('OSS-CLIENT')
  private ossClient: Minio.Client;
  private logger = new Logger();

  /**
   * 后端上传文件到oss
   * @param objectName 对象名(文件名)
   * @param stream 文件流
   * @param bucketName 桶名
   * @returns 文件url
   */
  async upload(
    objectName: string,
    stream: string | Buffer,
    bucketName = 'prisma-ai',
  ) {
    try {
      await this.ossClient.putObject(bucketName, objectName, stream);
      const url = await this.ossClient.presignedGetObject(
        bucketName,
        objectName,
      );
      return url;
    } catch (error) {
      this.logger.error(error, 'OssService ~ upload');
      throw new Error(`Failed to upload to OSS: ${error.message}`);
    }
  }

  /**
   * 获取预签名URL以前端直传文件到oss
   * @param name 对象名(文件名)
   * @param bucketName 桶名
   * @param expire 预签名URL过期时间
   * @returns 预签名URL
   */
  async presignedPutObject(
    name: string,
    bucketName = 'prisma-ai',
    expire = 3600,
  ) {
    try {
      return await this.ossClient.presignedPutObject(bucketName, name, expire); // 桶名、对象名、预签名URL过期时间
    } catch (error) {
      this.logger.error(error, 'OssController ~ presignedPutObject');
    }
  }
}
