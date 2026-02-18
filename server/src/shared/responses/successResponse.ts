interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export function successResponse<T>(message: string, data: T): SuccessResponse<T> {
  return { success: true, message, data };
}
