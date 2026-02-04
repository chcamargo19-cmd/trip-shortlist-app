'use client'
import { createBrowserClient } from '@/utils/supabase'

export default function AuthButton({ session }: { session: any }) {
  const supabase = createBrowserClient()

  const signIn = async () => {
    await supabase.auth.signInWithOtp({
      email: prompt('Email'),
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div>
      {session ? (
        <button onClick={signOut} className="bg-red-600 text-white px-4 py-2 rounded">
          Sign out
        </button>
      ) : (
        <button onClick={signIn} className="bg-blue-600 text-white px-4 py-2 rounded">
          Sign in
        </button>
      )}
    </div>
  )
}
