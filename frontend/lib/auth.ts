export function setTokenCookie(token: string) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 12}; samesite=lax${secure}`;
}

export function clearTokenCookie() {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `token=; path=/; max-age=0; samesite=lax${secure}`;
}
