import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FindWorker - वर्क ब्रिज',
  description: 'Find and hire workers easily',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}