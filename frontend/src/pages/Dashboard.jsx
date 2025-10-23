import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../lib/api";
import DateRangePicker from "../components/ui/DateRangePicker";
import Button from "../components/ui/Button";

function useProductivity(from, to) {
  return useQuery({
    queryKey: ["productivity", from, to],
    queryFn: async () => {
      const { data } = await api.get("/reports/productivity", {
        params: { from, to },
      });
      return data;
    },
    enabled: !!from && !!to,
  });
}

function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await api.get("/tasks");
      // Backend returns a paginator object { data: [...], ... }
      // Normalize to an array for the dashboard
      if (Array.isArray(data)) return data;
      return data?.data || [];
    },
  });
}

function useTimeEntries(limit = 5) {
  return useQuery({
    queryKey: ["time-entries", limit],
    queryFn: async () => {
      const { data } = await api.get("/time-entries", {
        params: { per_page: limit },
      });
      return data?.data || [];
    },
  });
}

export default function Dashboard() {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  const [range, setRange] = React.useState({ start: first, end: last });

  const { data, isLoading } = useProductivity(range.start, range.end);
  const { data: tasks = [] } = useTasks();
  const { data: timeEntries = [] } = useTimeEntries(5);
  const { data: overview } = useQuery({
    queryKey: ["overview"],
    queryFn: async () => (await api.get("/overview")).data,
  });

  // Calculate total minutes
  const totalMinutes = React.useMemo(() => {
    if (!data) return 0;
    return (
      data.per_client?.reduce((a, b) => a + Number(b.minutes || 0), 0) || 0
    );
  }, [data]);

  // Calculate top client
  const topClient = React.useMemo(() => {
    const arr = data?.per_client || [];
    if (arr.length === 0) return "—";
    const top = arr.reduce(
      (m, x) => (Number(x.minutes) > Number(m.minutes) ? x : m),
      arr[0]
    );
    return `Client #${top.client_id} (${top.minutes}m)`;
  }, [data]);

  // Calculate top user
  const topUser = React.useMemo(() => {
    const arr = data?.per_user || [];
    if (arr.length === 0) return "—";
    const top = arr.reduce(
      (m, x) => (Number(x.minutes) > Number(m.minutes) ? x : m),
      arr[0]
    );
    return `User #${top.user_id} (${top.minutes}m)`;
  }, [data]);

  // Task statistics
  const taskStats = React.useMemo(() => {
    if (!tasks || tasks.length === 0)
      return { total: 0, todo: 0, inProgress: 0, done: 0, urgent: 0 };

    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo" || !t.status).length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      urgent: tasks.filter((t) => t.priority >= 4).length,
    };
  }, [tasks]);

  // Format hours from minutes
  const formatHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const kpis = [
    {
      title: "Temps total",
      value: formatHours(totalMinutes),
      subtitle: `${totalMinutes} minutes`,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
      color: "from-primary-400 to-primary-600",
      textColor: "text-primary-700",
      link: "/reports",
    },
    {
      title: "Tâches actives",
      value: taskStats.inProgress,
      subtitle: `${taskStats.total} total`,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      color: "from-blue-500 to-sky-600",
      textColor: "text-sky-600",
      link: "/tasks",
    },
    {
      title: "Tâches urgentes",
      value: taskStats.urgent,
      subtitle: `Priorité haute`,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      color: "from-orange-500 to-red-500",
      textColor: "text-red-600",
      link: "/tasks",
    },
    {
      title: "Meilleur client",
      value: topClient,
      subtitle: "Ce mois",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
      textColor: "text-pink-600",
      link: "/clients",
    },
    {
      title: "Clients actifs",
      value: overview?.counts?.clients ?? "—",
      subtitle: "Total",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "from-emerald-500 to-green-600",
      textColor: "text-emerald-600",
      link: "/clients",
    },
    {
      title: "Documents",
      value: overview?.counts?.docs ?? "—",
      subtitle: "Fichiers",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      color: "from-indigo-500 to-purple-600",
      textColor: "text-indigo-600",
      link: "/clients",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-2">
            Tableau de bord
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Vue d'ensemble de votre productivité
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
          <DateRangePicker
            start={range.start}
            end={range.end}
            onChange={setRange}
          />
          <a
            target="_blank"
            rel="noreferrer"
            href="http://127.0.0.1:8002/api/exports/time-excel"
          >
            <Button className="!from-emerald-500 !to-green-600 !shadow-emerald-500/30 hover:!shadow-emerald-500/50 hover:!from-emerald-600 hover:!to-green-700">
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exporter (Excel)
            </Button>
          </a>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {kpis.map((kpi, i) => {
          const KPIWrapper = kpi.link ? Link : "div";
          const wrapperProps = kpi.link ? { to: kpi.link } : {};

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <KPIWrapper
                {...wrapperProps}
                className="block relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <motion.div
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  className="relative"
                >
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.color} opacity-10 dark:opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-300`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 dark:via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {kpi.title}
                        </div>
                        {kpi.subtitle && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {kpi.subtitle}
                          </div>
                        )}
                      </div>
                      <div
                        className={`relative p-2 sm:p-3 rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                      >
                        <div className="relative w-6 h-6 sm:w-auto sm:h-auto">
                          {kpi.icon}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-2xl sm:text-3xl font-bold ${kpi.textColor} mb-1 truncate`}
                    >
                      {isLoading ? (
                        <div className="h-8 sm:h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 sm:w-24" />
                      ) : (
                        kpi.value
                      )}
                    </div>
                    {kpi.link && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        <span>Voir détails</span>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.div>
              </KPIWrapper>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <QuickActionCard
          title="Nouveau client"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
          link="/clients"
          color="from-blue-500 to-sky-600"
        />
        <QuickActionCard
          title="Nouvelle tâche"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          link="/tasks"
          color="from-purple-500 to-pink-500"
        />
        <QuickActionCard
          title="Temps enregistré"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          link="/tasks"
          color="from-emerald-500 to-green-600"
        />
        <QuickActionCard
          title="Rapports"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          link="/reports"
          color="from-orange-500 to-red-500"
        />
      </div>

      {/* Charts and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Minutes par client"
          data={(data?.per_client || []).map((x) => ({
            label: `C${x.client_id}`,
            value: Number(x.minutes || 0),
          }))}
          isLoading={isLoading}
        />
        <BarChart
          title="Minutes par collaborateur"
          data={(data?.per_user || []).map((x) => ({
            label: `U${x.user_id}`,
            value: Number(x.minutes || 0),
          }))}
          isLoading={isLoading}
        />

        {/* Task Distribution */}
        <TaskDistributionChart taskStats={taskStats} />

        {/* Recent Time Entries */}
        <RecentTimeEntries entries={timeEntries} />

        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-lg transition-colors duration-300">
          <h3 className="font-semibold text-base sm:text-lg mb-4 text-gray-900 dark:text-gray-100">
            Activité récente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Nouveaux documents
              </h4>
              <ul className="space-y-2">
                {(overview?.recent_docs || []).length > 0 ? (
                  (overview?.recent_docs || []).map((d) => (
                    <li
                      key={d.id}
                      className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="truncate">
                        {d.title}{" "}
                        <span className="text-gray-400 dark:text-gray-500">
                          ({d.category || "—"})
                        </span>
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 italic">
                    Aucun document récent
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Nouveaux clients
              </h4>
              <ul className="space-y-2">
                {(overview?.recent_clients || []).length > 0 ? (
                  (overview?.recent_clients || []).map((c) => (
                    <li
                      key={c.id}
                      className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="truncate">{c.raison_sociale}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 italic">
                    Aucun client récent
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart({ title, data, isLoading }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-lg transition-colors duration-300"
    >
      <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 sm:w-12 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex-1 h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-10 sm:w-12 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-400 dark:text-gray-500">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs sm:text-sm">Aucune donnée</span>
          </div>
        ) : (
          data.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <div className="w-10 sm:w-12 text-xs font-medium text-gray-600 dark:text-gray-400">
                {d.label}
              </div>
              <div className="flex-1 h-6 sm:h-8 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.value / max) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-sm"
                />
              </div>
              <div className="w-10 sm:w-12 text-xs font-semibold text-gray-900 dark:text-gray-100 text-right">
                {d.value}m
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function QuickActionCard({ title, icon, link, color }) {
  return (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${color} p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <div className="font-semibold text-sm sm:text-base lg:text-lg text-center sm:text-left">
            {title}
          </div>
          <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            {icon}
          </div>
        </div>
        <div className="mt-2 text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors text-center sm:text-left">
          Accès rapide →
        </div>
      </motion.div>
    </Link>
  );
}

function TaskDistributionChart({ taskStats }) {
  const statusData = [
    {
      label: "À faire",
      value: taskStats.todo,
      color: "from-gray-400 to-gray-500",
    },
    {
      label: "En cours",
      value: taskStats.inProgress,
      color: "from-blue-500 to-sky-600",
    },
    {
      label: "Terminé",
      value: taskStats.done,
      color: "from-emerald-500 to-green-600",
    },
  ];

  const total = taskStats.total || 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-lg transition-colors duration-300"
    >
      <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">
        Distribution des tâches
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {statusData.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
            <div className="h-2 sm:h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / total) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${item.color} rounded-full shadow-sm`}
              />
            </div>
          </div>
        ))}
      </div>
      {taskStats.urgent > 0 && (
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-semibold">
              {taskStats.urgent} tâches urgentes
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function RecentTimeEntries({ entries }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const calculateDuration = (entry) => {
    if (!entry.started_at) return "—";
    const start = new Date(entry.started_at);
    const end = entry.ended_at ? new Date(entry.ended_at) : new Date();
    const minutes = Math.floor((end - start) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-lg transition-colors duration-300"
    >
      <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">
        Entrées de temps récentes
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-400 dark:text-gray-500">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs sm:text-sm">Aucune entrée récente</span>
          </div>
        ) : (
          entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                  Tâche #{entry.task_id}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(entry.started_at)}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-sm sm:text-base font-semibold text-primary-600 dark:text-primary-400">
                  {calculateDuration(entry)}
                </div>
                {!entry.ended_at && (
                  <div className="text-xs text-emerald-500 font-medium flex items-center justify-end gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    En cours
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
