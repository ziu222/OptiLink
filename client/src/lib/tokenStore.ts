/**
 * Holds the access token in module scope so the axios interceptor can read it
 * without importing React (avoids a context <-> axios import cycle).
 * Nothing is persisted — a page reload starts with no token and the app
 * performs a silent refresh.
 */
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};
