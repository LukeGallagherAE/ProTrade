import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'ProTrade - Field Service Platform',
  description: 'Job management platform for trade businesses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Sidebar />
          <div className="ml-60">
            <Header />
            <main className="pt-14 min-h-screen">
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
