import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ui/theme-provider'
import AppQueryClientProvider from '@/components/root/query-client-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Faculty Grid',
  description: 'University administration platform',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="id"
      className={cn('font-sans', 'font-sans', inter.variable)}
      suppressHydrationWarning
    >
      <body>
        <AppQueryClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AppQueryClientProvider>
      </body>
    </html>
  )
}
