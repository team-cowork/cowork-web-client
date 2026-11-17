export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}
