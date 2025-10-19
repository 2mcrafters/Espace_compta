import { useSelector } from 'react-redux'
import { selectUser } from '../store/redux/store'

export default function RequirePermission({ perm, children, fallback=null }){
  const user = useSelector(selectUser)
  const has = !!user && Array.isArray(user.permissions) && user.permissions.includes(perm)
  if (!has) return fallback ?? <div className="text-sm text-red-600">403 — You don’t have permission: {perm}</div>
  return children
}
