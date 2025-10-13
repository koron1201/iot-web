import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Link, NavLink } from 'react-router-dom'
import './style.css'

const RootLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="min-h-dvh flex flex-col">
    <header className="border-b">
      <div className="container py-4 flex items-center justify-between">
        <Link to="/" className="font-semibold">Smart ICT Lab</Link>
        <nav className="text-sm gap-4 hidden md:flex">
          <NavLink to="/about" className={({ isActive }) => isActive ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}>研究室概要</NavLink>
          <NavLink to="/research" className={({ isActive }) => isActive ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}>研究内容</NavLink>
          <NavLink to="/members" className={({ isActive }) => isActive ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}>メンバー</NavLink>
          <NavLink to="/news" className={({ isActive }) => isActive ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}>ニュース</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}>お問い合わせ</NavLink>
        </nav>
      </div>
    </header>
    <main className="flex-1 container py-8">{children}</main>
    <footer className="border-t">
      <div className="container py-6 text-sm text-muted-foreground">© Smart ICT Lab</div>
    </footer>
  </div>
)

const Home: React.FC = () => (
  <RootLayout>
    <section className="py-12">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Smart ICT Labへようこそ</h1>
      <p className="mt-4 max-w-prose text-muted-foreground">
        スマートICTソリューション研究室の活動・研究成果・メンバー情報をご紹介します。
      </p>
    </section>
  </RootLayout>
)

const About: React.FC = () => (
  <RootLayout>
    <h1 className="text-2xl font-semibold">研究室概要</h1>
  </RootLayout>
)

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <RootLayout>
    <h1 className="text-2xl font-semibold">{title}</h1>
    <p className="mt-4 text-muted-foreground">このページは準備中です。</p>
  </RootLayout>
)

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/research', element: <Placeholder title="研究内容" /> },
  { path: '/members', element: <Placeholder title="メンバー" /> },
  { path: '/news', element: <Placeholder title="ニュース" /> },
  { path: '/contact', element: <Placeholder title="お問い合わせ" /> },
])

const container = document.getElementById('root')!
createRoot(container).render(<RouterProvider router={router} />)

