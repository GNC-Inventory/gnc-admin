// app/layout.tsx
'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
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
        {/* Global max-width container */}
        <div style={{ maxWidth: '2000px', margin: '0 auto' }}>
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

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                maxWidth: '400px',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0', // <-- fixed here
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f0fdf4',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
              loading: {
                style: {
                  background: '#eff6ff',
                  color: '#1e40af',
                  border: '1px solid #dbeafe',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#eff6ff',
                },
              },
            }}
          />
        </div>
      </body>
    </html>
  )
}
