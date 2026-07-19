import type { User as UserType } from '../types'

interface UserProps {
  user: UserType
}

export default function User({ user }: UserProps) {
  return (
    <article className="card user-card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
    </article>
  )
}
