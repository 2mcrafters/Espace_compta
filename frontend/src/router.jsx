import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from './store/redux/authSlice'
import { selectUser, selectLoading } from './store/redux/store'

function Protected({ children }) {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const loading = useSelector(selectLoading)
  React.useEffect(() => {
    if (!user && !loading) dispatch(fetchUser())
  }, [user, loading, dispatch])
  if (loading) return <div className="p-4">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

const Login = React.lazy(() => import('./pages/Login'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Clients = React.lazy(() => import('./pages/Clients'))
const Portfolios = React.lazy(() => import("./pages/Portfolios"));
const Tasks = React.lazy(() => import("./pages/Tasks"));
const Requests = React.lazy(() => import("./pages/Requests"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Collaborators = React.lazy(() => import("./pages/Collaborators"));
const SettingsRoles = React.lazy(() => import("./pages/SettingsRoles"));
const Reports = React.lazy(() => import("./pages/Reports"));

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <React.Suspense fallback={<div className="p-4">Loading...</div>}>
        <Login />
      </React.Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <Protected>
        <App />
      </Protected>
    ),
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <Dashboard />
          </React.Suspense>
        ),
      },
      {
        path: "clients",
        element: (
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <Clients />
          </React.Suspense>
        ),
      },
      {
        path: "portfolios",
        element: (
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <Portfolios />
          </React.Suspense>
        ),
      },
      {
        path: "tasks",
        element: (
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <Tasks />
          </React.Suspense>
        ),
      },
      {
        path: "requests",
        element: (
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <Requests />
          </React.Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <Profile />
          </React.Suspense>
        ),
      },
      {
        path: "reports",
        element: (
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <Reports />
          </React.Suspense>
        ),
      },
      {
        path: "collaborators",
        element: (
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <Collaborators />
          </React.Suspense>
        ),
      },
      {
        path: "settings/roles",
        element: (
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <SettingsRoles />
          </React.Suspense>
        ),
      },
    ],
  },
]);

export default router
