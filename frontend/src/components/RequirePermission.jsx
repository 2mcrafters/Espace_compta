import { useSelector } from 'react-redux'
import { selectUser } from '../store/redux/store'

export default function RequirePermission({ perm, children, fallback=null }){
  const user = useSelector(selectUser)
  const perms = Array.isArray(perm) ? perm : [perm];
  const has =
    !!user &&
    Array.isArray(user.permissions) &&
    perms.some((p) => user.permissions.includes(p));
  if (!has)
    return (
      fallback ?? (
        <div className="text-sm text-red-600">
          403 — You don’t have permission:{" "}
          {Array.isArray(perm) ? perm.join(" | ") : perm}
        </div>
      )
    );
  return children
}
