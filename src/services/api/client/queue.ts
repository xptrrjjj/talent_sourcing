// Request queue manager to prevent duplicate in-flight requests
export class RequestQueue {
  private queue: Map<string, Promise<any>> = new Map();

  getKey(method: string, url: string, data?: any): string {
    return `${method}:${url}:${JSON.stringify(data || {})}`;
  }

  async enqueue<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // If there's already a request in flight, return its promise
    const existingRequest = this.queue.get(key);
    if (existingRequest) {
      return existingRequest;
    }

    // Create new request promise
    const request = operation().finally(() => {
      this.queue.delete(key);
    });

    // Add to queue
    this.queue.set(key, request);
    return request;
  }

  clear() {
    this.queue.clear();
  }
}

export const requestQueue = new RequestQueue();