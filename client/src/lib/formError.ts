import axios from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ApiErrorBody } from '../types/auth';

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
      message: body?.error?.message ?? err.message ?? 'Request failed',
    });
    return;
  }

  setError('root', { type: 'server', message: 'Unexpected error, please try again' });
}
