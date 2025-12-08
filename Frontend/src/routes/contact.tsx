import React, { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card } from '../components/ui/card'

export const Contact: React.FC = () => {
  const [mail, setMail] = useState('')
  const [detail, setDetail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:8000/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: mail,
          detail: detail
        })
      })

      if (response.ok) {
        setMessage('お問い合わせを送信しました。')
        setMail('')
        setDetail('')
      } else {
        setMessage('送信に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Error submitting contact:', error)
      setMessage('送信中にエラーが発生しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">お問い合わせ</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mail" className="block text-sm font-medium mb-2">
              メールアドレス
            </label>
            <Input
              id="mail"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="your-email@example.com"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="detail" className="block text-sm font-medium mb-2">
              お問い合わせ内容
            </label>
            <Textarea
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="お問い合わせ内容をご記入ください"
              required
              rows={6}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? '送信中...' : 'お問い合わせを送信'}
          </Button>

          {message && (
            <div className={`text-sm p-3 rounded ${
              message.includes('送信しました') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </form>
      </Card>
    </div>
  )
}

export default Contact



