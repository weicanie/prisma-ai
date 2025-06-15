import { Inject, Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
@Injectable()
export class OssService {
  @Inject('OSS-CLIENT')
  private ossClient: Minio.Client;
  private logger = new Logger();

  async presignedPutObject(
    name: string,
    bucketName = 'coderhow',
    expire = 3600,
  ) {
    try {
      return await this.ossClient.presignedPutObject(bucketName, name, expire); // 桶名、对象名、预签名URL过期时间
    } catch (error) {
      this.logger.error(error, 'OssController ~ presignedPutObject');
    }
  }
}
