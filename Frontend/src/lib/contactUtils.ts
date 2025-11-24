import { useCallback, useMemo } from 'react'

// デバウンス関数（パフォーマンス向上）
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  return useCallback(
    (() => {
      let timeoutId: number
      return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => callback(...args), delay)
      }
    })() as T,
    [callback, delay]
  )
}

// メモ化されたフェッチ関数
export const createApiClient = () => {
  const baseURL = '/api'
  
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 10000
  ): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  return {
    checkRateLimit: async () => {
      return fetchWithTimeout(`${baseURL}/contact/rate-limit/status`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      })
    },
    
    submitContact: async (data: { mail: string; detail: string }) => {
      return fetchWithTimeout(`${baseURL}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })
    }
  }
}

// フォームバリデーション（メモ化）
export const useFormValidation = () => {
  return useMemo(() => ({
    validateEmail: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email.trim())
    },
    
    validateDetail: (detail: string): { isValid: boolean; message: string } => {
      const trimmed = detail.trim()
      if (trimmed.length < 10) {
        return { isValid: false, message: '10文字以上入力してください' }
      }
      if (trimmed.length > 2000) {
        return { isValid: false, message: '2000文字以内で入力してください' }
      }
      return { isValid: true, message: '' }
    }
  }), [])
}