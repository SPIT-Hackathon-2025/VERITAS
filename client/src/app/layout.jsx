"use client"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import React from "react"
import { Navbar } from "@/components/Navbar"
import { usePathname } from "next/navigation"

const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  const pathname = usePathname()

  const hiddenRoutes = ["/"]

  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100">
        {hiddenRoutes.includes(pathname) && <Navbar className={jetBrainsMono.className} />}
        {children}
      </body>
    </html>
  )
}
