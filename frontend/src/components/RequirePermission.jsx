import { useSelector } from 'react-redux'
import { selectUser } from '../store/redux/store'

export default function RequirePermission({ perm, children, fallback }) {
  const user = useSelector(selectUser);
  const perms = Array.isArray(perm) ? perm : [perm];

  // Check if user is an admin (admins have access to everything)
  const isAdmin =
    !!user && Array.isArray(user.roles) && user.roles.includes("ADMIN");

  // Check if user has the specific permission
  const hasPermission =
    !!user &&
    Array.isArray(user.permissions) &&
    perms.some((p) => user.permissions.includes(p));

  const has = isAdmin || hasPermission;

  if (!has) {
    // If fallback is explicitly provided (even if null), use it
    // Otherwise show the default error message
    if (fallback !== undefined) {
      return fallback;
    }
    return (
      <div className="text-sm text-red-600">
        403 — You don't have permission:{" "}
        {Array.isArray(perm) ? perm.join(" | ") : perm}
      </div>
    );
  }
  return children;
}
