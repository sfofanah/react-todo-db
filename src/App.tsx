// src/App.tsx
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import Auth from './Auth'
import './App.css'

// Define what a Todo looks like
interface Todo {
  id: number
  text: string
}

function App() {
  // State for the list of todos — typed as an array of Todo objects
  const [todos, setTodos] = useState<Todo[]>([])

  const [inputValue, setInputValue] = useState('')
  
  const [loading, setLoading] = useState(true)
  
  const [user, setUser] = useState<User | null>(null)
  
  const [authLoading, setAuthLoading] = useState(true)
  
  async function fetchTodos() {
    setLoading(true)

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)

      if (session?.user) {
        fetchTodos()
      } else {
        setTodos([])
      }
  })

  return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const { data, error } = await supabase
      .from('todos')
      .insert([{ text: inputValue.trim() }])
      .select()

    if (error) {
      console.error('Error adding todo:', error)
    } else {
      setTodos([...todos, data[0] as Todo])
      setInputValue('')
    }
  }
  
  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      setTodos(todos.filter(todo => todo.id !== id))
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    }
  }

  if (authLoading) {
    return (
      <div className="app">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <h1>React Todo App</h1>
        <Auth />
      </div>
    )
  }

  return (
  <div className="app">
    <div className="header">
      <h1>React Todo App</h1>
      <div>
        <span>{user.email}</span>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>

    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add a new todo..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>

    {loading ? (
      <p>Loading todos...</p>
    ) : (
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <span>{todo.text}</span>
            <button
              className="delete-btn"
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
)

}
export default App