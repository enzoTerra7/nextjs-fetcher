type HeadersInterceptor = (
  headers: HeadersInit
) => HeadersInit | Promise<HeadersInit>;

interface NextJsFetcherOptions {
  baseURL?: string;
  headers?: HeadersInit;
}

export class NextJsFetcher {
  private baseURL?: string;
  private headers?: HeadersInit;
  private interceptorFn?: HeadersInterceptor;

  constructor(options?: NextJsFetcherOptions) {
    this.baseURL = options?.baseURL;
    this.headers = {
      "Content-Type": "application/json",
      ...options?.headers,
    };
  }

  interceptor(fn: HeadersInterceptor) {
    this.interceptorFn = fn;
  }

  private async prepareHeaders(
    headers: HeadersInit = {}
  ): Promise<HeadersInit> {
    if (this.interceptorFn) {
      return await this.interceptorFn({
        ...this.headers,
        ...headers,
      });
    }
    return headers;
  }

  private buildUrl(url: string) {
    return this.baseURL ? `${this.baseURL}${url}` : url;
  }

  async get<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<
    PartiallyData & {
      data: T | null;
    }
  > {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  async post<T = unknown>(
    url: string,
    body?: any,
    options?: RequestInit
  ): Promise<
    PartiallyData & {
      data: T | null;
    }
  > {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        ...(options?.headers || {}),
      },
    });
  }

  async put<T = unknown>(
    url: string,
    body?: any,
    options?: RequestInit
  ): Promise<
    PartiallyData & {
      data: T | null;
    }
  > {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        ...(options?.headers || {}),
      },
    });
  }

  async delete<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<
    PartiallyData & {
      data: T | null;
    }
  > {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }

  async patch<T = unknown>(
    url: string,
    body?: any,
    options?: RequestInit
  ): Promise<
    PartiallyData & {
      data: T | null;
    }
  > {
    return this.request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        ...(options?.headers || {}),
      },
    });
  }

  async request<T = unknown>(
    url: string,
    options: RequestInit
  ): Promise<
    PartiallyData & {
      data: T | null;
    }
  > {
    const headers = await this.prepareHeaders(options.headers || {});
    const response = await fetch(this.buildUrl(url), {
      ...options,
      headers,
    });

    const partiallyData = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      options: {
        ...options,
        headers,
      },
    };

    if (!response.ok) {
      try {
        const errorBody = await response.json();

        throw {
          ...partiallyData,
          err: errorBody,
        };
      } catch {
        throw partiallyData;
      }
    }

    try {
      const data = await response.json();

      return {
        ...partiallyData,
        data: data,
      };
    } catch {
      return {
        ...partiallyData,
        data: null,
      };
    }
  }
}

type PartiallyData = {
  status: number;
  statusText: string;
  headers: Headers;
  options: RequestInit;
};
