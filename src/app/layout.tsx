// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Apex Manager',
  description: 'Apex Manager Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1">
            <Navbar />
            <main className="overflow-auto" style={{ height: 'calc(100vh - 88px)' }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}

