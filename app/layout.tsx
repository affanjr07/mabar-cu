import "./globals.css"
import type { Metadata } from "next"
import { Orbitron, Inter } from "next/font/google"
import AuthProvider from "@/components/providers/AuthProvider"
import FloatingReportButton from "@/components/report/FloatingReportButton"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "MABAR.CU | Find Your Ultimate Squad",
  description: "Indonesia #1 Gaming Squad Platform. Cari teman mabar, bentuk party rank, ikut tournament esports, dan bangun komunitas gaming terbaikmu.",
  icons: {
    icon: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${orbitron.variable} ${inter.variable}`}>
        <AuthProvider>
          {children}
          <FloatingReportButton />
        </AuthProvider>
      </body>
    </html>
  )
}