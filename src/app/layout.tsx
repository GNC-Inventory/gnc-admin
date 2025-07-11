import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Apex Manager',
  description: 'Business management dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}