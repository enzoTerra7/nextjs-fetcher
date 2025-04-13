![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

# NextJS Fetcher

A lightweight, type-safe HTTP client for React and Next.js applications that provides a simple wrapper around the Fetch API.

## Features

- 🔄 Simple wrapper around the native Fetch API
- 🌐 Base URL configuration for all requests
- 🔒 Default and custom headers support
- 🔧 Header interceptors for authentication and other use cases
- 📦 Type-safe responses with TypeScript generics
- ⚠️ Automatic error handling for non-OK responses
- 🧩 Support for all common HTTP methods (GET, POST, PUT, DELETE, PATCH)

## Installation

```bash
# npm
npm install @enzotrr/nextjs-fetcher

# yarn
yarn add @enzotrr/nextjs-fetcher

# pnpm
pnpm add @enzotrr/nextjs-fetcher
```

## Usage

### Basic Setup

```typescript
import { NextJsFetcher } from '@enzotrr/nextjs-fetcher';

// Create a new instance with optional configuration
const fetcher = new NextJsFetcher({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use it in your components or API handlers
async function fetchData() {
  try {
    const data = await fetcher.get('/users');
    console.log(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}
```

### With Type Safety

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Get a typed response
const user = await fetcher.get<User>('/users/1');
console.log(user.name); // TypeScript knows the shape of 'user'

// Post with a typed request body and response
const newUser = await fetcher.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});
```

### Using Header Interceptors

```typescript
// Add an interceptor to modify headers before each request
// Useful for adding authentication tokens
fetcher.interceptor(async (headers) => {
  const token = await getAuthToken(); // Your token retrieval logic
  return {
    ...headers,
    'Authorization': `Bearer ${token}`,
  };
});

// Now all requests will include the Authorization header
const data = await fetcher.get('/protected-resource');
```

## API Reference

### Constructor

```typescript
new NextJsFetcher(options?: NextJsFetcherOptions)
```

#### Options

- `baseURL?: string` - Base URL for all requests
- `headers?: HeadersInit` - Default headers for all requests

### Methods

#### HTTP Methods

- `get<T = unknown>(url: string, options?: RequestInit): Promise<T>`
- `post<T = unknown>(url: string, body?: any, options?: RequestInit): Promise<T>`
- `put<T = unknown>(url: string, body?: any, options?: RequestInit): Promise<T>`
- `delete<T = unknown>(url: string, options?: RequestInit): Promise<T>`
- `patch<T = unknown>(url: string, body?: any, options?: RequestInit): Promise<T>`

#### Advanced Methods

- `request<T = unknown>(url: string, options: RequestInit): Promise<T>` - Make a custom request
- `interceptor(fn: HeadersInterceptor)` - Set a header interceptor function

#### Types

```typescript
type HeadersInterceptor = (headers: HeadersInit) => HeadersInit | Promise<HeadersInit>;

interface NextJsFetcherOptions {
  baseURL?: string;
  headers?: HeadersInit;
}
```

## Error Handling

The fetcher automatically throws an error for non-OK responses (status outside the 200-299 range). The error includes the status code and response body:

```typescript
try {
  const data = await fetcher.get('/some-endpoint');
  // Process successful response
} catch (error) {
  // Error message format: "HTTP error! Status: 404, Body: Not Found"
  console.error(error);
}
```

## 📄 License

This project is licensed under the MIT License.  
You can freely use it for personal or commercial purposes.  
See the [LICENSE](./LICENSE) file for more details.
