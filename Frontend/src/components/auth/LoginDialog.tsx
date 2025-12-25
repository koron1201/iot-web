import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"

type LoginDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 検証は親側またはコンテキストで実施するため、ここではイベントを渡す
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>カレンダーにアクセスするにはログインが必要です</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <label htmlFor="login-id" className="text-sm font-medium">
              ID
            </label>
            <Input
              id="login-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="lab"
              autoComplete="username"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="login-password" className="text-sm font-medium">
              パスワード
            </label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="guest"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={async () => {
                try {
                  await login(id.trim(), password)
                  setError("")
                  onOpenChange(false)
                  onSuccess()
                } catch {
                  setError("IDまたはパスワードが違います")
                }
              }}
            >
              ログイン
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default LoginDialog


