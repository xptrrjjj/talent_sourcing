// Batch processor for multiple API requests
export class BatchProcessor {
  private static instance: BatchProcessor;
  private batchTimeout: number = 50; // 50ms window for batching
  private batchSize: number = 10; // Max requests per batch
  private queue: Array<{
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private timeoutId: NodeJS.Timeout | null = null;

  static getInstance(): BatchProcessor {
    if (!BatchProcessor.instance) {
      BatchProcessor.instance = new BatchProcessor();
    }
    return BatchProcessor.instance;
  }

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.scheduleBatch();
    });
  }

  private scheduleBatch() {
    if (this.timeoutId) return;

    this.timeoutId = setTimeout(() => {
      this.processBatch();
    }, this.batchTimeout);
  }

  private async processBatch() {
    const batch = this.queue.splice(0, this.batchSize);
    this.timeoutId = null;

    if (batch.length === 0) return;

    try {
      const results = await Promise.allSettled(
        batch.map(item => item.operation())
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          batch[index].resolve(result.value);
        } else {
          batch[index].reject(result.reason);
        }
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }

    // Process remaining items if any
    if (this.queue.length > 0) {
      this.scheduleBatch();
    }
  }

  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.queue = [];
  }
}

export const batchProcessor = BatchProcessor.getInstance();