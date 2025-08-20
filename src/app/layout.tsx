// app/layout.tsx
'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import Head from 'next/head'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';
  const title = 'Apex Manager';
  const description = 'Apex Manager Dashboard';

  return (
    <html lang="en">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <body className={inter.className}>
        {isLoginPage ? (
          // Login page - full screen without sidebar/navbar
          <>{children}</>
        ) : (
          // All other pages - with sidebar and navbar
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  )
}