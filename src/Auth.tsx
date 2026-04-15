import { useState } from 'react'
import { supabase } from './lib/supabaseClient'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div>
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      {error && <p>{error}</p>}

      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp
          ? 'Already have an account? Sign In'
          : "Don't have an account? Sign Up"}
      </button>
    </div>
  )
}

export default Auth