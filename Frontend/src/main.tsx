import React from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import "./style.css"

import RootLayout from "@/routes/RootLayout"
import { About } from "@/routes/about"
import { Contact } from "@/routes/contact"
import { Home } from "@/routes/home"
import { Members } from "@/routes/members"
import { News } from "@/routes/news"
import { Research } from "@/routes/research"
import { Submission } from "@/routes/submission"
import { Calendar } from "@/routes/calendar"
import ProtectedRoute from "@/routes/ProtectedRoute"
import { AuthProvider } from "@/context/AuthContext"
import { Login } from "@/routes/Login"   // カレンダーぺージのログインページへのルート(23rd119)

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, 
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "research", element: <Research /> },
      { path: "members", element: <Members /> },
      { path: "news", element: <News /> },
      { path: "contact", element: <Contact /> },
      { path: "submission", element: <Submission /> },
      { path: "calendar", element: <Calendar />},
      /* 一時的にカレンダーぺージへのログイン機能の停止して、上行に置き換え(23rd119)
      { path: "calendar", element: (
        <ProtectedRoute>
          <Calendar />
        </ProtectedRoute>
      ) },
       */
       { path: "login", element: <Login /> }, /*カレンダーぺージのログインフォームへのルート(23rd119)*/
    ],
  },
])

const container = document.getElementById("root")!
createRoot(container).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)

