import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import RequirePermission from "../components/RequirePermission";

const STATUS = [
  {
    key: "EN_ATTENTE",
    label: "En attente",
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  {
    key: "EN_COURS",
    label: "En cours",
    color: "from-primary-400 to-primary-700",
    bgColor: "bg-primary-50",
    borderColor: "border-primary-200",
  },
  {
    key: "EN_VALIDATION",
    label: "En validation",
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    key: "TERMINEE",
    label: "Terminée",
    color: "from-emerald-400 to-green-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
];

const CATEGORIES = ["COMPTABLE", "FISCALE", "SOCIALE", "JURIDIQUE", "AUTRE"];
const NATURES = ["CONTINUE", "PONCTUELLE"];

function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await api.get("/tasks");
      return data.data ?? data;
    },
  });
}

function useUsersLookup() {
  return useQuery({
    queryKey: ["users-lookup"],
    queryFn: async () => {
      const { data } = await api.get("/users/lookup");
      // expected shape: [{ id, name, email }]
      return Array.isArray(data) ? data : data.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function Tasks() {
  const qc = useQueryClient();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: users = [], isLoading: loadingUsers } = useUsersLookup();
  const [runningByTask, setRunningByTask] = React.useState({});
  const [filters, setFilters] = React.useState({
    category: "",
    nature: "",
    owner: "",
  });
  const [stopEntry, setStopEntry] = React.useState({
    open: false,
    entryId: null,
    comment: "",
  });

  const startMutation = useMutation({
    mutationFn: async (taskId) => {
      const { data } = await api.post(`/tasks/${taskId}/time/start`, {});
      return data;
    },
    onSuccess: (entry) => {
      setRunningByTask((prev) => ({ ...prev, [entry.task_id]: entry.id }));
    },
  });

  const stopMutation = useMutation({
    mutationFn: async ({ entryId, comment }) => {
      const { data } = await api.post(`/time-entries/${entryId}/stop`, {
        comment,
      });
      return data;
    },
    onSuccess: (entry) => {
      setRunningByTask((prev) => ({ ...prev, [entry.task_id]: undefined }));
      setStopEntry({ open: false, entryId: null, comment: "" });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ taskId, userId }) => {
      const { data } = await api.post(`/tasks/${taskId}/assign`, {
        user_id: Number(userId),
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const quickUpdateMutation = useMutation({
    mutationFn: async ({ taskId, patch }) => {
      const { data } = await api.put(`/tasks/${taskId}`, patch);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const grouped = React.useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (filters.category && t.category !== filters.category) return false;
      if (filters.nature && t.nature !== filters.nature) return false;
      if (filters.owner && String(t.owner_id) !== String(filters.owner))
        return false;
      return true;
    });
    const g = Object.fromEntries(STATUS.map((s) => [s.key, []]));
    for (const t of filtered) {
      g[t.status ?? "EN_ATTENTE"].push(t);
    }
    return g;
  }, [tasks, filters]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
          Tâches
        </h1>
        <p className="text-gray-600">Suivez et gérez vos tâches par statut</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.category}
          onChange={(e) =>
            setFilters((f) => ({ ...f, category: e.target.value }))
          }
          options={[
            { value: "", label: "Catégorie" },
            ...CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          className="w-40"
        />
        <Select
          value={filters.nature}
          onChange={(e) =>
            setFilters((f) => ({ ...f, nature: e.target.value }))
          }
          options={[
            { value: "", label: "Nature" },
            ...NATURES.map((n) => ({ value: n, label: n })),
          ]}
          className="w-40"
        />
        <Select
          value={filters.owner}
          onChange={(e) => setFilters((f) => ({ ...f, owner: e.target.value }))}
          options={[
            { value: "", label: "Responsable" },
            ...users.map((u) => ({
              value: String(u.id),
              label: u.name || u.email,
            })),
          ]}
          className="w-56"
        />
        {(filters.category || filters.nature || filters.owner) && (
          <Button
            onClick={() => setFilters({ category: "", nature: "", owner: "" })}
            variant="secondary"
          >
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {STATUS.map((statusObj, colIndex) => (
          <motion.div
            key={statusObj.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIndex * 0.1 }}
            className={`rounded-2xl border-2 ${statusObj.borderColor} ${statusObj.bgColor} overflow-hidden shadow-lg`}
          >
            <div className={`bg-gradient-to-r ${statusObj.color} px-4 py-3`}>
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                {statusObj.label}
              </h3>
              <div className="text-xs text-white/80 mt-0.5">
                {(grouped[statusObj.key] ?? []).length} tâche(s)
              </div>
            </div>
            <div className="p-4 space-y-3 min-h-[200px]">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-white/50 rounded-xl animate-pulse"
                  />
                ))
              ) : (grouped[statusObj.key] ?? []).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <svg
                    className="w-12 h-12 mx-auto mb-2 opacity-50"
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
                  <p className="text-sm">Aucune tâche</p>
                </div>
              ) : (
                <AnimatePresence>
                  {(grouped[statusObj.key] ?? []).map((task, i) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={i}
                      runningEntryId={runningByTask[task.id]}
                      onStart={() => startMutation.mutate(task.id)}
                      onStop={() =>
                        runningByTask[task.id] &&
                        setStopEntry({
                          open: true,
                          entryId: runningByTask[task.id],
                          comment: "",
                        })
                      }
                      onAssign={(userId) =>
                        assignMutation.mutate({ taskId: task.id, userId })
                      }
                      users={users}
                      loadingUsers={loadingUsers}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Stop entry modal */}
      <Modal
        open={stopEntry.open}
        onClose={() =>
          setStopEntry({ open: false, entryId: null, comment: "" })
        }
        title="Arrêter le suivi"
        footer={
          <div className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 rounded-lg border-2 border-gray-200"
              onClick={() =>
                setStopEntry({ open: false, entryId: null, comment: "" })
              }
            >
              Annuler
            </button>
            <Button
              onClick={() =>
                stopMutation.mutate({
                  entryId: stopEntry.entryId,
                  comment: stopEntry.comment,
                })
              }
            >
              Arrêter
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Commentaire
          </label>
          <textarea
            className="w-full border rounded-lg p-2 min-h-[90px]"
            value={stopEntry.comment}
            onChange={(e) =>
              setStopEntry((s) => ({ ...s, comment: e.target.value }))
            }
            placeholder="Ajoutez un commentaire (optionnel)"
          />
        </div>
      </Modal>
    </div>
  );
}

function TaskCard({
  task,
  index,
  runningEntryId,
  onStart,
  onStop,
  onAssign,
  users = [],
  loadingUsers = false,
}) {
  const [assignee, setAssignee] = React.useState("");
  const [isHovered, setIsHovered] = React.useState(false);
  const userOptions = React.useMemo(() => {
    const opts = [{ value: "", label: "Assigner…" }];
    for (const u of users) {
      const label = u.name
        ? `${u.name} (${u.email})`
        : u.email || `User #${u.id}`;
      opts.push({ value: String(u.id), label });
    }
    return opts;
  }, [users]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative rounded-xl border-2 border-gray-200 bg-white p-4 shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 rounded-t-xl overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${task.progress ?? 0}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary-500 to-primary-700"
        />
      </div>

      <div className="flex items-start justify-between gap-3 mt-2">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">
            {task.title ?? task.name ?? `Tâche #${task.id}`}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {task.category || "Général"}
            </span>
            <span className="inline-flex items-center gap-1">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {task.due_at ?? "—"}
            </span>
          </div>
        </div>
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          className="text-sm font-bold text-gray-700 px-2 py-1 rounded-lg bg-gray-100"
        >
          {task.progress ?? 0}%
        </motion.div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {/* Assignees list */}
        {Array.isArray(task.assignees) && task.assignees.length > 0 && (
          <div className="flex -space-x-2 mb-2">
            {task.assignees.slice(0, 5).map((u, idx) => (
              <div
                key={u.id || idx}
                title={`${u.name || u.email}`}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white bg-primary-600 text-white text-[10px] font-bold"
              >
                {initials(u.name || u.email)}
              </div>
            ))}
            {task.assignees.length > 5 && (
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white bg-gray-200 text-gray-700 text-[10px] font-bold">
                +{task.assignees.length - 5}
              </div>
            )}
          </div>
        )}

        <RequirePermission
          perm="tasks.manage"
          fallback={
            !runningEntryId ? (
              <div className="text-xs text-center text-red-600 py-1">
                Pas de permission
              </div>
            ) : (
              <div className="text-xs text-center text-red-600 py-1">
                Pas de permission
              </div>
            )
          }
        >
          {!runningEntryId ? (
            <motion.button
              whileHover={{
                scale: 1.03,
                y: -2,
                boxShadow: "0 15px 30px rgba(16, 185, 129, 0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
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
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="relative z-10">Démarrer</span>
            </motion.button>
          ) : (
            <motion.button
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(244, 63, 94, 0.4)",
                  "0 0 0 8px rgba(244, 63, 94, 0)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              whileHover={{
                scale: 1.03,
                y: -2,
                boxShadow: "0 15px 30px rgba(239, 68, 68, 0.5)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={onStop}
              className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
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
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              <span className="relative z-10">Arrêter</span>
            </motion.button>
          )}
        </RequirePermission>

        <RequirePermission
          perm="tasks.manage"
          fallback={
            <div className="text-xs text-center text-red-600 py-1">
              Pas de permission
            </div>
          }
        >
          <div className="flex gap-2">
            <Select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              options={userOptions}
              className="flex-1 text-sm"
              disabled={loadingUsers}
            />
            <motion.button
              whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow: "0 10px 20px rgba(75, 85, 99, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => assignee && onAssign(assignee)}
              disabled={!assignee}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-semibold shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
              <span className="relative z-10">OK</span>
            </motion.button>
          </div>
        </RequirePermission>

        {/* Quick edit status/progress */}
        <RequirePermission perm="tasks.manage" fallback={null}>
          <div className="flex items-center gap-2 pt-2">
            <Select
              value={task.status}
              onChange={(e) =>
                quickUpdateMutation.mutate({
                  taskId: task.id,
                  patch: { status: e.target.value },
                })
              }
              options={STATUS.map((s) => ({ value: s.key, label: s.label }))}
              className="w-40 text-sm"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={task.progress ?? 0}
              onChange={(e) =>
                quickUpdateMutation.mutate({
                  taskId: task.id,
                  patch: { progress: Number(e.target.value) },
                })
              }
              className="flex-1"
            />
          </div>
        </RequirePermission>
      </div>
    </motion.div>
  );
}

// removed prompt helper; handled via modal state above

function initials(name) {
  if (!name) return "??";
  const parts = String(name).split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
