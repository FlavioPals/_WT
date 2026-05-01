import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const wirants = localFont({
  src: [
    { path: './fonts/Wirants-ExtraLight.otf', weight: '200', style: 'normal' },
    { path: './fonts/Wirants-Light.otf', weight: '300', style: 'normal' },
    { path: './fonts/Wirants-Regular.otf', weight: '400', style: 'normal' },
    { path: './fonts/Wirants-Medium.otf', weight: '500', style: 'normal' },
    { path: './fonts/Wirants-SemiBold.otf', weight: '600', style: 'normal' },
    { path: './fonts/Wirants-Bold.otf', weight: '700', style: 'normal' },
    { path: './fonts/Wirants-ExtraBold.otf', weight: '800', style: 'normal' },
    { path: './fonts/Wirants-Black.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-wirants',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Arquitetos Portfolio',
  description: 'Portfólio do escritório de arquitetura',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${wirants.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
