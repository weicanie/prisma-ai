import { Injectable, Logger } from '@nestjs/common';
//请求队列实现
interface QueueItem<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
}

@Injectable()
export class RequestQueueService {
  private readonly logger = new Logger(RequestQueueService.name);
  private queue: QueueItem<any>[] = [];
  private activeCount = 0;
  private readonly maxConcurrent: number;

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // 将请求添加到队列
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.queue.length === 0 || this.activeCount >= this.maxConcurrent) {
      return;
    }

    // 从队列取出一个请求
    const item = this.queue.shift();
    this.activeCount++;

    if (!item) return;

    // 执行请求
    item
      .fn()
      .then((result) => {
        item.resolve(result);
      })
      .catch((error) => {
        item.reject(error);
      })
      .finally(() => {
        this.activeCount--;
        this.processQueue(); // 处理下一个请求
      });
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getActiveCount(): number {
    return this.activeCount;
  }
}
