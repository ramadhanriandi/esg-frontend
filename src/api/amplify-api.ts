import { get, post, put, del } from "aws-amplify/api";

export type Query = Record<string, string | number | undefined>;
export type Headers = Record<string, string>;

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

// ----- API wrapper -----
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
        headers,
        queryParams: buildQueryParams(queryParams),
      },
    });
    const { body } = await op.response;
    return (await body.json()) as T;
  },

  async post<T = unknown>(
    apiName = "BackendApi",
    path: string,
    body?: Record<string, string>,
    headers?: Headers
  ): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    const op = post({
      apiName,
      path,
      options: {
        body,
        headers: isFormData ? headers : withJsonHeader(body, headers),
      },
    });

    const { body: res } = await op.response;
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
    const op = put({
      apiName,
      path,
      options: {
        body: bodyData,
        headers: withJsonHeader(body, headers),
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
      options: { headers },
    });
    const response = await op.response;
    try {
      return (await response) as T;
    } catch {
      return undefined as T;
    }
  },
};
