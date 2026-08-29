export interface User {
  _id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  tier: 'FREE' | 'PREMIUM';
  isVerified: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Shape of the backend error body: { success: false, error: { code, message, details? } }. */
export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}
