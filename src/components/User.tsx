import type { User as UserType } from '../types'

interface UserProps {
  user: UserType | null
  isLoading?: boolean
}

export default function User({ user, isLoading = false }: UserProps) {
  if (isLoading || !user) {
    return (
      <article className="card user-card">
        <h2>User Profile</h2>
        <p>Loading user profile...</p>
      </article>
    )
  }

  return (
    <article className="card user-card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
    </article>
  )
}
