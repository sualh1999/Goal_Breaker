'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MenuIcon, HomeIcon } from 'lucide-react'

interface HeaderProps {
  // Add any specific props if needed
}

export function Header({}: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-primary/10 to-accent/10 px-4 md:px-6 shadow-sm">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        <HomeIcon className="h-6 w-6" />
        <span className="sr-only">Home</span>
      </Link>
      {/* Mobile Sidebar Toggle - using the Sheet in layout.tsx */}
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <h1 className="text-xl font-bold text-foreground">Smart Goal Breaker</h1>
        {/* Placeholder for potential right-side elements like user profile or settings */}
        <div className="ml-auto flex-1 md:grow-0">
          {/* Search or other utilities */}
        </div>
      </div>
    </header>
  )
}
