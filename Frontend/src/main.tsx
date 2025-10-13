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
    ],
  },
])

const container = document.getElementById("root")!
createRoot(container).render(<RouterProvider router={router} />)

