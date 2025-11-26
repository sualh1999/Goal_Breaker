'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation' // Import useParams
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ReloadIcon } from '@radix-ui/react-icons' // Assuming Radix icons are available or can be added

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Task {
  id: string
  title: string
  status?: 'pending' | 'completed' // Make status optional for now, will fetch
}

interface Goal {
  id: string
  goal_text: string
  complexity: number
  regenerated_count: number
  tasks: Task[]
}

export default function GoalDetailPage() { // Removed params from here
  const params = useParams()
  const goalId = params.id as string // Cast to string
  const router = useRouter()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const fetchGoal = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE_URL}/goals/${goalId}`)
      setGoal(response.data)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || 'Failed to fetch goal details.')
      } else {
        setError('An unexpected error occurred while fetching goal.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (goalId) {
      fetchGoal()
    }
  }, [goalId])

  const handleTaskStatusChange = async (taskId: string, currentStatus: 'pending' | 'completed') => {
    const newStatus: 'pending' | 'completed' = currentStatus === 'completed' ? 'pending' : 'completed'
    try {
      // Optimistic update
      setGoal((prevGoal) => {
        if (!prevGoal) return null
        const updatedTasks = prevGoal.tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
        return { ...prevGoal, tasks: updatedTasks }
      })

      await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, { status: newStatus })
      // If server update fails, fetch again to revert optimistic update
      // await fetchGoal(); 
    } catch (err) {
      setError('Failed to update task status. Please try again.')
      // Revert optimistic update on error
      fetchGoal();
    }
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    setError(null)
    try {
      const response = await axios.post(`${API_BASE_URL}/goals/${goalId}/regenerate`)
      setGoal(response.data)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || 'Failed to regenerate tasks.')
      } else {
        setError('An unexpected error occurred during regeneration.')
      }
    } finally {
      setIsRegenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p>Loading goal...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p>Goal not found.</p>
      </div>
    )
  }

  // Helper to determine text color for complexity badge
  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return 'bg-green-500 text-white'
    if (complexity <= 7) return 'bg-yellow-500 text-black'
    return 'bg-red-500 text-white'
  }

  return (
    <div className="flex flex-col items-center py-10 px-4 min-h-screen bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-2xl shadow-premium border-none">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-4">
          <CardTitle className="text-3xl font-bold text-primary">{goal.goal_text}</CardTitle>
          <Badge className={getComplexityColor(goal.complexity)}>
            Complexity: {goal.complexity}/10
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Regenerated: {goal.regenerated_count} times
            </p>
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 shadow-md"
            >
              {isRegenerating ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate Tasks'
              )}
            </Button>
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-4">Actionable Steps:</h3>
          <ul className="space-y-4">
            {goal.tasks.map((task) => (
              <li key={task.id} className="flex items-start space-x-3 group">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.status === 'completed'}
                  onCheckedChange={() => handleTaskStatusChange(task.id, task.status || 'pending')}
                  className="mt-1 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={`flex-1 text-lg font-medium leading-relaxed cursor-pointer transition-colors duration-200
                    ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground hover:text-primary'}`}
                >
                  {task.title}
                </label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
