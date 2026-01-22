'use client';

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/login';

  // Render nothing on server, wait for client mount
  if (!mounted) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed left-0 top-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/glob.jpg)',
          clipPath: 'polygon(0 0, calc((100vw - 1440px) / 2) 0, calc((100vw - 1440px) / 2) 100%, 0 100%)',
          zIndex: -1
        }}
      />
      
      <div 
        className="fixed right-0 top-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/glob.jpg)',
          clipPath: 'polygon(calc(50vw + 720px) 0, 100% 0, 100% 100%, calc(50vw + 720px) 100%)',
          zIndex: -1
        }}
      />

      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {isLoginPage ? (
          <>{children}</>
        ) : (
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
      </div>
    </>
  )
}