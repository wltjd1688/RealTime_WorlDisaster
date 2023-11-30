import React from 'react'
import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar';
import RecoidContextProvider from './recoilContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WorlDisaster',
  description: 'World Disaster Archive',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar/>
        <RecoidContextProvider>
          {children}
        </RecoidContextProvider>
        <RecoidContextProvider>
          {children}
        </RecoidContextProvider>
      </body>
    </html>
  )
}