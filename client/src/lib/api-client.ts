// Centralized API client with robust error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
}

class ApiClient {
  private baseURL: string = '';
  private defaultTimeout: number = 30000; // 30 seconds

  async request<T = any>(
    url: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      headers = {},
      ...fetchOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.baseURL + url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
        ...fetchOptions,
      });

      clearTimeout(timeoutId);

      // Handle non-ok responses
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorCode: string | undefined;

        // Try to parse error response as JSON
        try {
          const errorBody = await response.text();
          if (errorBody) {
            try {
              const errorJson = JSON.parse(errorBody);
              if (errorJson.error?.message) {
                errorMessage = errorJson.error.message;
                errorCode = errorJson.error.code;
              } else if (errorJson.message) {
                errorMessage = errorJson.message;
              }
            } catch {
              // If not JSON, use the text as error message
              errorMessage = errorBody;
            }
          }
        } catch {
          // Use default error message if can't read body
        }

        throw new ApiError(response.status, response.statusText, errorMessage, errorCode);
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return data as T;
      } else {
        const text = await response.text();
        return (text as unknown) as T;
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      if ((error as Error)?.name === 'AbortError') {
        throw new ApiError(408, 'Request Timeout', 'Request timed out');
      }

      // Network or other errors
      const err = error as Error;
      throw new ApiError(0, 'Network Error', err.message || 'Network request failed');
    }
  }

  // Convenience methods
  async get<T = any>(url: string, options?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, options?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(url: string, data?: any, options?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(url: string, data?: any, options?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string, options?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Helper function to handle common API error scenarios
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return error.message || 'Invalid data provided.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
}

// Helper to check if error is an unauthorized error
export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}