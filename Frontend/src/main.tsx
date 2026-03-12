import React from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import "./style.css"

import RootLayout from "@/routes/RootLayout"
import { About } from "@/routes/about"
import { Contact } from "@/routes/contact"
import { Home } from "@/routes/home"
import { WelcomeLoader } from "@/routes/WelcomeLoader"
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
      { index: true, element: <WelcomeLoader /> },
      { path: "about", element: <About /> },
      { path: "research", element: <Research /> },
      { path: "members", element: <Members /> },
      { path: "news", element: <News /> },
      { path: "contact", element: <Contact /> },
      { path: "submission", element: <Submission /> },
      { path: "calendar", element: <Calendar />},
      /* 一時的にカレンダーぺージへの制限を解除して、上行に置き換え(23rd119)_カレンダーぺージからの置き換え
      path: "calendar", element: (
        <ProtectedRoute>
          <Calendar />
        </ProtectedRoute>
      },
       */
    ],
  },
  //以下、カレンダーぺージからの追加(23rd119)
  {
    path: "/login", // 2. 【追加】 /login のルート
    element: <Login />,
  },
  // (もし登録ページも追加するならここ)
  // {
  //   path: "/register",
  //   element: <Register />,
  // }
],
{
  basename: "/iot-web"
}
)

const container = document.getElementById("root")!
createRoot(container).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)

