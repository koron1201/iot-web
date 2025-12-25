const rawBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined

/**
 * API のベースURL。
 * - 開発: デフォルトで http://localhost:8000
 * - 本番: Vite 環境変数 VITE_API_BASE_URL で上書き（末尾スラッシュは自動で除去）
 */
export const API_BASE_URL = (rawBaseUrl ?? "http://localhost:8000").replace(/\/+$/, "")

/**
 * API URL を安全に組み立てる（先頭スラッシュの有無を吸収）
 */
export const apiUrl = (path: string) => `${API_BASE_URL}/${String(path).replace(/^\/+/, "")}`


