import { get, post, put, del } from "aws-amplify/api";

export type Query = Record<string, string | number | undefined>;
export type Headers = Record<string, string>;

const OIDC_SESSION_KEY = "oidc.user";

function getAccessTokenFromSession(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = sessionStorage.getItem(OIDC_SESSION_KEY);
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw);
    return parsed.access_token as string | undefined;
  } catch {
    return undefined;
  }
}

export function buildQueryParams(
  queryParams?: Record<string, unknown>
): Record<string, string> | undefined {
  if (!queryParams) return undefined;
  return Object.fromEntries(
    Object.entries(queryParams)
      .filter(
        ([, v]) =>
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean"
      )
      .map(([k, v]) => [k, String(v)])
  );
}

function withJsonHeader(body: unknown, headers?: Headers): Headers | undefined {
  if (typeof FormData !== "undefined" && body instanceof FormData)
    return headers;
  return { "Content-Type": "application/json", ...(headers ?? {}) };
}

function withAuth(headers?: Headers): Headers | undefined {
  const token = getAccessTokenFromSession();
  if (!token) return headers;
  return {
    ...(headers ?? {}),
    Authorization: `Bearer ${token}`,
  };
}

export const amplifyApi = {
  async get<T = unknown>(
    apiName = "BackendApi",
    path: string,
    queryParams?: Query,
    headers?: Headers
  ): Promise<T> {
    const op = get({
      apiName,
      path,
      options: {
        headers: withAuth(headers),
        queryParams: buildQueryParams(queryParams),
      },
    });
    const { body } = await op.response;
    return (await body.json()) as T;
  },

  async post<T = unknown>(
    apiName = "BackendApi",
    path: string,
    body?: Record<string, any>,
    headers?: Headers
  ): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    const baseHeaders = isFormData ? headers : withJsonHeader(body, headers);

    const op = post({
      apiName,
      path,
      options: {
        body,
        headers: withAuth(baseHeaders),
      },
    });

    const { body: res, statusCode } = await op.response;
    if (statusCode === 204) {
      return undefined as T;
    }
    return (await res.json()) as T;
  },

  async put<T = unknown, TBody = unknown>(
    apiName = "BackendApi",
    path: string,
    body?: TBody,
    headers?: Headers
  ): Promise<T> {
    const isFormData = body instanceof FormData;
    const bodyData = isFormData ? body : JSON.stringify(body);
    const baseHeaders = withJsonHeader(body, headers);

    const op = put({
      apiName,
      path,
      options: {
        body: bodyData,
        headers: withAuth(baseHeaders),
      },
    });
    const { body: res } = await op.response;
    return (await res.json()) as T;
  },

  async delete<T = unknown>(
    apiName = "BackendApi",
    path: string,
    headers?: Headers
  ): Promise<T> {
    const op = del({
      apiName,
      path,
      options: {
        headers: withAuth(headers),
      },
    });
    const response = await op.response;
    try {
      return (await response) as T;
    } catch {
      return undefined as T;
    }
  },
};
