export interface FortnoxErrorResponse {
  ErrorInformation: {
    Error: number;
    Message: string;
    Code: number;
  };
}

export interface HttpClientOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
}
