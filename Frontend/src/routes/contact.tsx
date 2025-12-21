import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card } from '../components/ui/card'
import { CosmicNavbar } from "@/components/layout/CosmicNavbar"

export const Contact: React.FC = () => {
  const [mail, setMail] = useState('')
  const [detail, setDetail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

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
        navigate('/')
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
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/Attached_image.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/75 to-slate-950/85 backdrop-blur-[2px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(96,165,250,0.25),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.18),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.22),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.0)_18%,rgba(255,255,255,0.06)_32%,rgba(255,255,255,0.0)_60%,rgba(255,255,255,0.05)_78%,rgba(255,255,255,0.0)_100%)] opacity-60" />

      <CosmicNavbar />

      <div className="relative container py-12 max-w-3xl mx-auto text-white">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-100">
              Contact
            </span>
            <div>
              <h1 className="text-3xl font-semibold drop-shadow flex items-center gap-2">
                <span className="text-cyan-200">🛰️</span> お問い合わせ
              </h1>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card className="border-cyan-300/30 bg-slate-900/50 backdrop-blur text-white shadow-[0_0_40px_-12px_rgba(56,189,248,0.6)] p-5 sm:p-6">
            <p className="text-xs text-cyan-100/80">返信目安</p>
            <p className="text-sm text-white flex items-center gap-2">2日以内 <span className="text-cyan-200 text-base"></span></p>
          </Card>
          <Card className="border-purple-300/30 bg-slate-900/50 backdrop-blur text-white shadow-[0_0_40px_-12px_rgba(168,85,247,0.6)] p-5 sm:p-6">
            <p className="text-xs text-cyan-100/80">想定内容</p>
            <p className="text-sm text-white">取材 / 共同研究 / 学生相談 / 見学</p>
          </Card>
        </div>
        
        <Card className="relative overflow-hidden p-6 bg-white/92 backdrop-blur border border-white/50 text-slate-900 shadow-[0_10px_50px_-15px_rgba(59,130,246,0.5)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.16),transparent_30%)]" />
          <div className="relative space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="mail" className="block text-sm font-medium mb-2 text-white">
                メールアドレス
              </label>
              <Input
                id="mail"
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="your-email@example.com"
                required
                className="w-full bg-white/85 border border-white/70 shadow-inner focus-visible:ring focus-visible:ring-cyan-300/60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="detail" className="block text-sm font-medium text-white">
                  お問い合わせ内容
                </label>
                <span className="text-[11px] text-white">できるだけ具体的に</span>
              </div>
              <Textarea
                id="detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="お問い合わせ内容をご記入ください"
                required
                rows={6}
                className="w-full bg-white/85 border border-white/70 shadow-inner focus-visible:ring focus-visible:ring-cyan-300/60"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:brightness-110 disabled:opacity-70"
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
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Contact



