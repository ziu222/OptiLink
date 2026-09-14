import axios from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ApiErrorBody } from '../types/auth';

/** Extracts the backend's `error.message` from a failed request, for call sites without a form. */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    return body?.error?.message ?? err.message ?? fallback;
  }
  return fallback;
}

/**
 * Maps a failed request onto react-hook-form errors:
 * - a 422 with `error.details` → per-field errors
 * - anything else → a form-level `root` error
 */
export function applyServerError<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>
): void {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    const details = body?.error?.details;

    if (details && details.length > 0) {
      for (const d of details) {
        setError(d.field as Path<T>, { type: 'server', message: d.message });
      }
      return;
    }

    setError('root', {
      type: 'server',
      message: body?.error?.message ?? err.message ?? 'Yêu cầu không thành công',
    });
    return;
  }

  setError('root', { type: 'server', message: 'Đã xảy ra lỗi, vui lòng thử lại' });
}
