const ACCESS_TOKEN_KEY = 'xkwanza.accessToken';
const REFRESH_TOKEN_KEY = 'xkwanza.refreshToken';

// Nota: em produção, o refresh token deve idealmente viver num cookie httpOnly.
// Nesta fase o backend expõe-o via corpo da resposta, pelo que é guardado em localStorage.
export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
