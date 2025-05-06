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
        ...(this.headers || {}),
        ...headers,
      });
    }
    return { ...(this.headers || {}), ...headers };
  }

  private buildUrl(url: string) {
    return this.baseURL ? `${this.baseURL}${url}` : url;
  }

  async get<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<
    PartiallyData & {
      data: T;
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
      data: T;
    }
  > {
    // Check if body is FormData
    const isFormData = body instanceof FormData;

    // Don't stringify FormData and don't set Content-Type (browser will set it automatically)
    const processedBody = isFormData ? body : JSON.stringify(body);

    // For FormData, we should not set Content-Type header
    const headers = isFormData
      ? { ...options?.headers }
      : {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        };

    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: processedBody,
      headers,
    });
  }

  async put<T = unknown>(
    url: string,
    body?: any,
    options?: RequestInit
  ): Promise<
    PartiallyData & {
      data: T;
    }
  > {
    const isFormData = body instanceof FormData;
    const processedBody = isFormData ? body : JSON.stringify(body);

    const headers = isFormData
      ? { ...options?.headers }
      : {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        };

    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: processedBody,
      headers,
    });
  }

  async delete<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<
    PartiallyData & {
      data: T;
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
      data: T;
    }
  > {
    const isFormData = body instanceof FormData;
    const processedBody = isFormData ? body : JSON.stringify(body);

    const headers = isFormData
      ? { ...options?.headers }
      : {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        };

    return this.request<T>(url, {
      ...options,
      method: "PATCH",
      body: processedBody,
      headers,
    });
  }

  async request<T = unknown>(
    url: string,
    options: RequestInit
  ): Promise<
    PartiallyData & {
      data: T;
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
      const err = await response
        .json()
        .then((data) => {
          return data;
        })
        .catch(() => {
          return null;
        });

      throw {
        ...partiallyData,
        error: err,
      };
    }

    const data = await response
      .json()
      .then((data) => data)
      .catch((json) => json);

    return {
      ...partiallyData,
      data: data as T,
    };
  }
}

type PartiallyData = {
  status: number;
  statusText: string;
  headers: Headers;
  options: RequestInit;
};
