'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { StoredGoal, getStoredGoals } from '@/lib/local-storage'
import { cn } from '@/lib/utils'
import { GoalIcon } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onLinkClick?: () => void;
  isCollapsed: boolean;
}

export function Sidebar({ className, onLinkClick, isCollapsed }: SidebarProps) {
  const [goals, setGoals] = useState<StoredGoal[]>([])
  const pathname = usePathname()

  useEffect(() => {
    setGoals(getStoredGoals())
  }, [pathname])

  return (
    <div className={cn('pb-12 bg-card', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {isCollapsed ? (
            <h2 className="mb-2 px-2 text-center text-lg font-semibold tracking-tight text-primary">
              <GoalIcon className="h-6 w-6 mx-auto" />
            </h2>
          ) : (
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary">
              My Goals
            </h2>
          )}
          <div className="space-y-1">
            {goals.length === 0 ? (
              <p className={cn("px-4 text-sm text-muted-foreground", isCollapsed && "hidden")}>No goals saved yet.</p>
            ) : (
              <div className="space-y-1">
                {goals.map((goal) => (
                  <Link key={goal.id} href={`/goal/${goal.id}`} onClick={onLinkClick}>
                    <button
                      className={cn(
                        'w-full justify-start',
                        'inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9',
                        isCollapsed ? "px-2" : "px-4 py-2",
                        pathname === `/goal/${goal.id}`
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                          : 'text-foreground hover:bg-muted hover:text-primary'
                      )}
                    >
                      {isCollapsed ? (
                        <GoalIcon className="h-5 w-5 text-primary" />
                      ) : (
                        goal.title
                      )}
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
