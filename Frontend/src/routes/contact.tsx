import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card } from '../components/ui/card'

// レート制限情報の型定義
interface RateLimitStatus {
  ip_address: string
  current_requests: number
  max_requests: number
  time_window_minutes: number
  remaining_requests: number
  is_limited: boolean
}

interface RateLimitCheck {
  ip_address: string
  status: RateLimitStatus
  warning: boolean
  message: string
}

export const Contact: React.FC = () => {
  const [mail, setMail] = useState('')
  const [detail, setDetail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [rateLimitError, setRateLimitError] = useState<string>('')
  const [validationErrors, setValidationErrors] = useState<{mail: string, detail: string}>({mail: '', detail: ''})
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isComponentReady, setIsComponentReady] = useState(false)

  // コンポーネントの初期化処理
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // DOMの初期化を待つ
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true)
          } else {
            window.addEventListener('load', () => resolve(true), { once: true })
          }
        })
        
        // コンポーネントの初期化完了
        await new Promise(resolve => setTimeout(resolve, 50)) // 短い遅延でスムーズな描画
        
        setIsComponentReady(true)
        
        // ローディング終了
        setTimeout(() => {
          setIsPageLoading(false)
        }, 100) // フェードイン効果のための遅延
        
      } catch (error) {
        console.warn('Component initialization error:', error)
        // エラー時でも表示を継続
        setIsComponentReady(true)
        setIsPageLoading(false)
      }
    }
    
    initializeComponent()
  }, [])

  // バリデーション関数（先に定義）
  const validateEmail = useCallback((email: string): string => {
    const trimmed = email.trim()
    if (!trimmed) return ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(trimmed) ? '' : '有効なメールアドレスを入力してください'
  }, [])

  const validateDetail = useCallback((detail: string): string => {
    const trimmed = detail.trim()
    if (!trimmed) return ''
    if (trimmed.length < 10) return '10文字以上入力してください'
    if (trimmed.length > 2000) return '2000文字以内で入力してください'
    return ''
  }, [])

  // コンポーネンットの初期化処理
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // DOMの初期化を待つ
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true)
          } else {
            window.addEventListener('load', () => resolve(true), { once: true })
          }
        })
        
        // コンポーネントの初期化完了
        await new Promise(resolve => setTimeout(resolve, 50)) // 短い遅延でスムーズな描画
        
        setIsComponentReady(true)
        
        // ローディング終了
        setTimeout(() => {
          setIsPageLoading(false)
        }, 100) // フェードイン効果のための遅延
        
      } catch (error) {
        console.warn('Component initialization error:', error)
        // エラー時でも表示を継続
        setIsComponentReady(true)
        setIsPageLoading(false)
      }
    }
    
    initializeComponent()
  }, [])

  // コンポーネンットの初期化処理
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // DOMの初期化を待つ
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true)
          } else {
            window.addEventListener('load', () => resolve(true), { once: true })
          }
        })
        
        // コンポーネントの初期化完了
        await new Promise(resolve => setTimeout(resolve, 50)) // 短い遅延でスムーズな描画
        
        setIsComponentReady(true)
        
        // ローディング終了
        setTimeout(() => {
          setIsPageLoading(false)
        }, 100) // フェードイン効果のための遅延
        
      } catch (error) {
        console.warn('Component initialization error:', error)
        // エラー時でも表示を継続
        setIsComponentReady(true)
        setIsPageLoading(false)
      }
    }
    
    initializeComponent()
  }, [])

  // 送信時のみレート制限チェック（軽量化）
  const checkRateLimitOnSubmit = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒に短縮
      
      const response = await fetch('/api/contact/rate-limit/check', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        return !data.status?.is_limited
      }
    } catch (error) {
      // エラー時は送信を許可（フォールバック）
      console.warn('Rate limit check failed, allowing submission:', error)
      return true
    }
    return true
  }, [])



  // 送信可能かどうかの計算（メモ化・バリデーション考慮）
  const canSubmit = useMemo(() => {
    return !isSubmitting && 
           mail.trim() !== '' && 
           detail.trim() !== '' &&
           !validationErrors.mail &&
           !validationErrors.detail &&
           validateEmail(mail) === '' &&
           validateDetail(detail) === '' &&
           !rateLimitError
  }, [isSubmitting, mail, detail, validationErrors, rateLimitError, validateEmail, validateDetail])



  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit) return

    setIsSubmitting(true)
    setMessage('')

    // 送信時のみレート制限チェック
    const isAllowed = await checkRateLimitOnSubmit()
    if (!isAllowed) {
      setMessage('送信制限に達しています。しばらく時間をおいてからお試しください。')
      setRateLimitError('送信制限中')
      setIsSubmitting(false)
      return
    }

    try {
      // タイムアウト付き送信
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒タイムアウト
      
      const response = await fetch('/api/contact/', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          mail: mail.trim(),
          detail: detail.trim()
        })
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        setMessage('お問い合わせを送信しました。ありがとうございます。')
        setMail('')
        setDetail('')
        setRateLimitError('') // エラーをクリア
      } else if (response.status === 429) {
        setMessage('送信制限に達しました。しばらく時間をおいてからお試しください。')
        setRateLimitError('送信制限中')
      } else {
        setMessage('送信に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Error submitting contact:', error)
      setMessage('送信中にエラーが発生しました。ネットワークを確認してください。')
    } finally {
      setIsSubmitting(false)
    }
  }, [mail, detail, canSubmit, checkRateLimitOnSubmit])



  // 入力変更時のハンドラ（メモ化・バリデーション付き）
  const handleMailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMail(value)
    
    // リアルタイムバリデーション（デバウンス）
    setTimeout(() => {
      const error = validateEmail(value)
      setValidationErrors(prev => ({...prev, mail: error}))
    }, 500)
  }, [validateEmail])

  const handleDetailChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setDetail(value)
    
    // リアルタイムバリデーション（デバウンス）
    setTimeout(() => {
      const error = validateDetail(value)
      setValidationErrors(prev => ({...prev, detail: error}))
    }, 500)
  }, [validateDetail])

  // ローディング中の表示
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">ページを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  // コンポーネントが準備不完全な場合
  if (!isComponentReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse bg-muted rounded-lg h-96 w-full max-w-2xl mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-2xl mx-auto animate-in fade-in duration-300">
      <h1 className="text-2xl font-semibold mb-8">お問い合わせ</h1>
      
      {/* レート制限エラー時のみ表示 */}
      {rateLimitError && (
        <div className="mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">🚫</span>
              <div>
                <p className="text-red-800 font-medium">送信制限に達しています</p>
                <p className="text-red-600 text-sm">
                  しばらく時間をおいてからお試しください。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Card className="p-6 animate-in slide-in-from-bottom-4 duration-500 delay-150">
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-700 delay-300">
          <div className="animate-in slide-in-from-left-4 duration-500 delay-500">
            <label htmlFor="detail" className="block text-sm font-medium mb-2">
              メールアドレス *
            </label>
            <Input
              id="mail"
              type="email"
              value={mail}
              onChange={handleMailChange}
              placeholder="your-email@example.com"
              required
              disabled={isSubmitting || !!rateLimitError}
              className={`w-full ${validationErrors.mail ? 'border-red-500' : ''}`}
              autoComplete="email"
            />
            {validationErrors.mail && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.mail}</p>
            )}
          </div>

          <div className="animate-in slide-in-from-left-4 duration-500 delay-700">
            <label htmlFor="detail" className="block text-sm font-medium mb-2">
              お問い合わせ内容 *
            </label>
            <Textarea
              id="detail"
              value={detail}
              onChange={handleDetailChange}
              placeholder="お問い合わせ内容をご記入ください（最低10文字以上）"
              required
              rows={6}
              disabled={isSubmitting || !!rateLimitError}
              className={`w-full ${validationErrors.detail ? 'border-red-500' : ''}`}
              minLength={10}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                現在の文字数: {detail.length}文字
              </p>
              {validationErrors.detail && (
                <p className="text-red-500 text-xs">{validationErrors.detail}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full animate-in slide-in-from-bottom-4 duration-500 delay-1000"
          >
            {isSubmitting ? '送信中...' : rateLimitError ? '送信制限中' : 'お問い合わせを送信'}
          </Button>

          {message && (
            <div className={`text-sm p-3 rounded transition-all duration-200 animate-in slide-in-from-top-2 ${
              message.includes('送信しました') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1 animate-in fade-in duration-500 delay-1200">
            <p>• お問い合わせは24時間以内に返信いたします</p>
            <p>• スパム防止のため送信回数に制限があります</p>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default Contact



