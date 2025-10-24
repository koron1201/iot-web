export const AUTH_KEY = "auth:isAuthenticated"

export function verifyCredentials(id: string, password: string): boolean {
  return id === "lab" && password === "guest"
}

export function loadAuth(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === "1"
  } catch {
    return false
  }
}

export function saveAuth(isAuthenticated: boolean): void {
  try {
    if (isAuthenticated) {
      localStorage.setItem(AUTH_KEY, "1")
    } else {
      localStorage.removeItem(AUTH_KEY)
    }
  } catch {
    // ignore
  }
}


