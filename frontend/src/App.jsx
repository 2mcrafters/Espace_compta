import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Badge from "./components/ui/Badge";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./store/redux/authSlice";
import { selectUser } from "./store/redux/store";
import Drawer from "./components/ui/Drawer";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import ThemeToggle from "./components/ui/ThemeToggle";

export default function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  async function onLogout() {
    await dispatch(logout());
    navigate("/login", { replace: true });
  }

  const linkBase =
    "px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-3 font-medium relative overflow-hidden group";
  const active = ({ isActive }) =>
    isActive
      ? `${linkBase} bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:scale-[1.02] hover:-translate-y-0.5`
      : `${linkBase} text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-[1.02] hover:-translate-y-0.5`;

  const navItems = [
    {
      to: "/",
      label: "Tableau de bord",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      to: "/reports",
      label: "Rapports",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 3v18m4-10v10M7 13v8M3 21h18"
          />
        </svg>
      ),
    },
    {
      to: "/collaborators",
      label: "Collaborateurs",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      to: "/portfolios",
      label: "Portefeuilles",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7h18M3 12h18M3 17h18"
          />
        </svg>
      ),
    },
    {
      to: "/clients",
      label: "Clients",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      to: "/tasks",
      label: "Tâches",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      to: "/requests",
      label: "Demandes",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      to: "/profile",
      label: "Profil",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.121 17.804A8 8 0 1118.878 6.196 8 8 0 015.12 17.804zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];
  // Settings section (only visible via URL unless we add permission wrapper around it)
  navItems.push({
    to: "/settings/roles",
    label: "Rôles et permissions",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35.64-.155 1.2-.58 1.065-2.573-.94-1.543.826-3.31 2.37-2.37.995.606 2.146.24 2.573-1.066z"
        />
      </svg>
    ),
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Sidebar (desktop) */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden lg:flex w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col transition-colors duration-300"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-700 dark:to-primary-500 flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </motion.div>
            <div>
              <div className="font-bold text-lg bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:text-white dark:bg-none">
                Espace Compta
              </div>
              <div className="text-xs text-gray-500 dark:text-white/80">
                Gestion simplifiée
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <NavLink to={item.to} className={active} end={item.to === "/"}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
                <motion.span
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10"
                >
                  {item.icon}
                </motion.span>
                <span className="relative z-10">{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user?.name || user?.email}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {user?.roles?.[0] || "Utilisateur"}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex justify-center">
            <ThemeToggle />
          </div>

          <motion.button
            whileHover={{
              scale: 1.03,
              y: -2,
              borderColor: "rgb(252, 165, 165)",
              backgroundColor: "rgb(254, 242, 242)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirmLogoutOpen(true)}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 flex items-center justify-center gap-2 font-semibold relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-100/30 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
            <svg
              className="w-5 h-5 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="relative z-10">Déconnexion</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile drawer navigation */}
      <Drawer
        open={mobileOpen}
        side="left"
        title="Espace Compta"
        onClose={() => setMobileOpen(false)}
      >
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? `${linkBase} bg-primary-600 text-white`
                  : `${linkBase} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`
              }
              end={item.to === "/"}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {/* Theme Toggle in Mobile Drawer */}
          <div className="pt-4 flex justify-center">
            <ThemeToggle />
          </div>

          <button
            onClick={() => {
              setMobileOpen(false);
              setConfirmLogoutOpen(true);
            }}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
          >
            Déconnexion
          </button>
        </div>
      </Drawer>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top header with hamburger and user badge */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white lg:hidden">
                Espace Compta
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle for Desktop (in header) */}
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>

              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block truncate max-w-[120px] md:max-w-[200px]">
                {user?.name || user?.email}
              </div>
              {Array.isArray(user?.roles) &&
                user.roles.slice(0, 1).map((r) => (
                  <Badge key={r} color="primary" className="uppercase text-xs">
                    {r}
                  </Badge>
                ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[100vw] overflow-x-hidden"
        >
          <Outlet />
        </motion.div>
      </main>
      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Confirmer la déconnexion"
        description="Voulez-vous vraiment vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        variant="primary"
        onConfirm={() => {
          setConfirmLogoutOpen(false);
          onLogout();
        }}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </div>
  );
}
