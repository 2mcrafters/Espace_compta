import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../lib/api'
import DateRangePicker from '../components/ui/DateRangePicker'
import Button from '../components/ui/Button'

function useProductivity(from, to){
  return useQuery({
    queryKey: ['productivity', from, to],
    queryFn: async () => {
      const { data } = await api.get('/reports/productivity', { params: { from, to } })
      return data
    },
    enabled: !!from && !!to,
  })
}

export default function Dashboard(){
  const today = new Date()
  const first = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10)
  const last = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().slice(0,10)
  const [range, setRange] = React.useState({ start: first, end: last })
  const { data, isLoading } = useProductivity(range.start, range.end)
  const { data: overview } = useQuery({
    queryKey: ["overview"],
    queryFn: async () => (await api.get("/overview")).data,
  });

  const totalMinutes = React.useMemo(() => {
    if (!data) return 0;
    const c =
      data.per_client?.reduce((a, b) => a + Number(b.minutes || 0), 0) || 0;
    return c;
  }, [data]);
  const topClient = React.useMemo(() => {
    const arr = data?.per_client || [];
    if (arr.length === 0) return "—";
    const top = arr.reduce(
      (m, x) => (Number(x.minutes) > Number(m.minutes) ? x : m),
      arr[0]
    );
    return `Client #${top.client_id} (${top.minutes}m)`;
  }, [data]);
  const topUser = React.useMemo(() => {
    const arr = data?.per_user || [];
    if (arr.length === 0) return "—";
    const top = arr.reduce(
      (m, x) => (Number(x.minutes) > Number(m.minutes) ? x : m),
      arr[0]
    );
    return `User #${top.user_id} (${top.minutes}m)`;
  }, [data]);

  const kpis = [
    {
      title: "Total minutes",
      value: totalMinutes,
      icon: "⏱️",
      color: "from-primary-400 to-primary-600",
      textColor: "text-primary-700",
    },
    {
      title: "Top client",
      value: topClient,
      icon: "🏆",
      color: "from-purple-500 to-pink-500",
      textColor: "text-pink-600",
    },
    {
      title: "Top collaborator",
      value: topUser,
      icon: "⭐",
      color: "from-orange-500 to-red-500",
      textColor: "text-red-600",
    },
    {
      title: "Clients",
      value: overview?.counts?.clients ?? "—",
      icon: "👥",
      color: "from-blue-500 to-sky-600",
      textColor: "text-sky-600",
    },
    {
      title: "Portefeuilles",
      value: overview?.counts?.portfolios ?? "—",
      icon: "🗂️",
      color: "from-indigo-500 to-purple-600",
      textColor: "text-indigo-600",
    },
    {
      title: "Documents",
      value: overview?.counts?.docs ?? "—",
      icon: "📄",
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">Vue d'ensemble de votre productivité</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{
              y: -8,
              scale: 1.03,
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
              transition: { type: "spring", stiffness: 300 },
            }}
            className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity duration-300`}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-600">
                  {kpi.title}
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className="text-3xl"
                >
                  {kpi.icon}
                </motion.div>
              </div>
              <div className={`text-3xl font-bold ${kpi.textColor}`}>
                {isLoading ? (
                  <div className="h-9 bg-gray-200 rounded animate-pulse w-24" />
                ) : (
                  kpi.value
                )}
              </div>
            </div>
          </motion.div>
        ))}
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
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">
            Activité récente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                Nouveaux documents
              </h4>
              <ul className="space-y-2">
                {(overview?.recent_docs || []).map((d) => (
                  <li key={d.id} className="text-sm text-gray-700">
                    {d.title}{" "}
                    <span className="text-gray-400">({d.category || "—"})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                Nouveaux clients
              </h4>
              <ul className="space-y-2">
                {(overview?.recent_clients || []).map((c) => (
                  <li key={c.id} className="text-sm text-gray-700">
                    {c.raison_sociale}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart({ title, data, isLoading }){
  const max = Math.max(1, ...data.map(d => d.value))
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
    >
      <h3 className="font-semibold text-lg mb-6 text-gray-900">{title}</h3>
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Aucune donnée
          </div>
        ) : (
          data.map((d, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 text-xs font-medium text-gray-600">{d.label}</div>
              <div className="flex-1 h-8 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.value/max)*100}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-sm"
                />
              </div>
              <div className="w-12 text-xs font-semibold text-gray-900 text-right">{d.value}m</div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
