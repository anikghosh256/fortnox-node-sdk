export interface FortnoxErrorResponse {
  ErrorInformation: {
    error: number;
    message: string;
    code: number;
  };
}

export interface HttpClientOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
}
