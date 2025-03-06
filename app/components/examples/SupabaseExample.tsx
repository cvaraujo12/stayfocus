'use client'

import { useSupabase } from '@/app/hooks/useSupabase'
import { useEffect, useState } from 'react'

type Task = {
  id: string
  title: string
  completed: boolean
}

export function SupabaseExample() {
  const { supabase } = useSupabase()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setTasks(data || [])
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [supabase])

  async function addTask(title: string) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title, completed: false }])
        .select()
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setTasks([data, ...tasks])
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
    }
  }

  async function toggleTask(id: string, completed: boolean) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id)

      if (error) {
        throw error
      }

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed } : task
      ))
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Minhas Tarefas</h2>
      
      {/* Formulário para adicionar tarefa */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const input = form.elements.namedItem('title') as HTMLInputElement
          if (input.value.trim()) {
            addTask(input.value)
            input.value = ''
          }
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          name="title"
          placeholder="Nova tarefa..."
          className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Adicionar
        </button>
      </form>

      {/* Lista de tarefas */}
      <ul className="space-y-2">
        {tasks.map(task => (
          <li
            key={task.id}
            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-md shadow"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => toggleTask(task.id, e.target.checked)}
              className="w-4 h-4"
            />
            <span className={task.completed ? 'line-through text-gray-500' : ''}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
} 