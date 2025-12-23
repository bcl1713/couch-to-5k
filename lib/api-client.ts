/**
 * Type-safe API client for making HTTP requests
 */

export interface ApiError {
  error: string;
  offline?: boolean;
  queued?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
  ok: boolean;
}

/**
 * Configuration options for API requests
 */
export interface ApiRequestOptions extends RequestInit {
  /**
   * Whether to throw an error on non-OK responses
   * @default false
   */
  throwOnError?: boolean;
}

/**
 * Makes a type-safe fetch request to the API
 *
 * @param url - The API endpoint URL
 * @param options - Fetch options including custom throwOnError flag
 * @returns Promise with typed response data and error information
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { throwOnError = false, ...fetchOptions } = options;

  try {
    const response = await fetch(url, fetchOptions);
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    if (response.ok) {
      const data = isJson ? await response.json() : undefined;
      return {
        data,
        status: response.status,
        ok: true,
      };
    }

    // Handle error responses
    const errorData: ApiError = isJson
      ? await response.json()
      : { error: `Server error (${response.status})` };

    if (throwOnError) {
      throw new Error(errorData.error);
    }

    return {
      error: errorData,
      status: response.status,
      ok: false,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to connect. Please check your internet connection.";

    if (throwOnError) {
      throw error;
    }

    return {
      error: { error: errorMessage },
      status: 0,
      ok: false,
    };
  }
}

/**
 * Makes a GET request to the API
 */
export async function apiGet<T = unknown>(
  url: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "GET",
  });
}

/**
 * Makes a POST request to the API
 */
export async function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Makes a PUT request to the API
 */
export async function apiPut<T = unknown>(
  url: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Makes a DELETE request to the API
 */
export async function apiDelete<T = unknown>(
  url: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "DELETE",
  });
}

/**
 * Helper to format user-friendly error messages, with special handling for offline scenarios
 */
export function formatApiError(error: ApiError | undefined): string {
  if (!error) return "An unknown error occurred";

  if (error.offline && error.queued) {
    return "You're offline. Your action has been saved and will sync when you're back online.";
  }

  return error.error || "An unknown error occurred";
}
