import { useEffect, useState } from 'react'
import { auth, provider } from '../firebase'
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [])

  const handleLogin = async () => {
    await signInWithPopup(auth, provider)
  }

  const handleLogout = async () => {
    await signOut(auth)
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        {user.photoURL && (
          <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full border" />
        )}
        <span className="text-sm font-medium text-gray-700">{user.displayName || user.email}</span>
        <button onClick={handleLogout} className="btn-secondary py-1 px-3 text-xs">Logout</button>
      </div>
    )
  }

  return (
    <button onClick={handleLogin} className="btn-primary py-1 px-3 text-xs">Sign in with Google</button>
  )
} 