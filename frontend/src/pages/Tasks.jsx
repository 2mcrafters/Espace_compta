import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Badge from "../components/ui/Badge";
import RequirePermission from "../components/RequirePermission";

const STATUS = [
  {
    key: "EN_ATTENTE",
    label: "En attente",
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    dotColor: "bg-slate-400",
    headerGradient: "from-slate-300 to-slate-500",
  },
  {
    key: "EN_COURS",
    label: "En cours",
    color: "from-primary-400 to-primary-700",
    bgColor: "bg-primary-50",
    borderColor: "border-primary-200",
    dotColor: "bg-blue-500",
    headerGradient: "from-blue-400 to-blue-600",
  },
  {
    key: "EN_VALIDATION",
    label: "En validation",
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    dotColor: "bg-amber-500",
    headerGradient: "from-amber-400 to-orange-500",
  },
  {
    key: "TERMINEE",
    label: "Terminée",
    color: "from-emerald-400 to-green-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    dotColor: "bg-emerald-500",
    headerGradient: "from-emerald-400 to-green-600",
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
  const [creating, setCreating] = React.useState(false);
  const [newDefaults, setNewDefaults] = React.useState(null);
  const [editingTask, setEditingTask] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState({
    open: false,
    taskId: null,
  });
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

  // Query for clients list
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await api.get("/clients");
      return data?.data ?? data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/tasks", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setCreating(false);
    },
    onError: (error) => {
      alert(
        `Erreur: ${
          error.response?.data?.message ||
          error.message ||
          "Impossible de créer la tâche"
        }`
      );
    },
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

  const deleteMutation = useMutation({
    mutationFn: async (taskId) => {
      const { data } = await api.delete(`/tasks/${taskId}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setConfirmDelete({ open: false, taskId: null });
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
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-2">
            Tâches
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez et gérez vos tâches par statut
          </p>
        </div>
        <RequirePermission perm="tasks.manage" fallback={null}>
          <Button onClick={() => setCreating(true)}>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Ajouter une tâche
          </Button>
        </RequirePermission>
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
            className={
              "relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 backdrop-blur-sm overflow-hidden shadow-sm"
            }
          >
            {/* subtle per-status accent line */}
            <div
              className={`h-0.5 w-full bg-gradient-to-r ${statusObj.headerGradient}`}
            />
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wide">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${statusObj.dotColor}`}
                    ></span>
                    {statusObj.label}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {(grouped[statusObj.key] ?? []).length} tâche(s)
                  </div>
                </div>
                <RequirePermission perm="tasks.manage" fallback={null}>
                  <button
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    title="Ajouter une tâche"
                    onClick={() => {
                      setNewDefaults({ status: statusObj.key });
                      setCreating(true);
                    }}
                  >
                    <svg
                      className="w-4 h-4 text-gray-700 dark:text-gray-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </RequirePermission>
              </div>
            </div>
            <div className="p-4 space-y-3 min-h-[200px]">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse"
                  />
                ))
              ) : (grouped[statusObj.key] ?? []).length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
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
                      onEdit={() => setEditingTask(task)}
                      onRequestDelete={() =>
                        setConfirmDelete({ open: true, taskId: task.id })
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

      {/* Create Task Modal */}
      {creating && (
        <CreateTaskModal
          onClose={() => {
            setCreating(false);
            setNewDefaults(null);
          }}
          onSave={(payload) => createMutation.mutate(payload)}
          saving={createMutation.isPending}
          clients={clients}
          users={users}
          initial={newDefaults || undefined}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <CreateTaskModal
          onClose={() => setEditingTask(null)}
          onSave={(payload) =>
            quickUpdateMutation.mutate(
              { taskId: editingTask.id, patch: payload },
              { onSuccess: () => setEditingTask(null) }
            )
          }
          saving={quickUpdateMutation.isPending}
          clients={clients}
          users={users}
          initial={editingTask}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Supprimer la tâche"
        description="Cette action est irréversible. Voulez-vous vraiment supprimer cette tâche ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onCancel={() => setConfirmDelete({ open: false, taskId: null })}
        onConfirm={() =>
          confirmDelete.taskId && deleteMutation.mutate(confirmDelete.taskId)
        }
      />
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
  onEdit,
  onRequestDelete,
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

  function formatDate(value) {
    if (!value) return null;
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return null;
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch (e) {
      return null;
    }
  }

  function statusBadgeColor(key) {
    switch (key) {
      case "EN_COURS":
        return "blue";
      case "EN_VALIDATION":
        return "amber";
      case "TERMINEE":
        return "emerald";
      default:
        return "gray";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 backdrop-blur p-4 shadow-sm hover:shadow-md transition-shadow"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* blue accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-t-xl" />
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Progress ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 rotate-[-90deg]" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              className="fill-none stroke-gray-200 dark:stroke-gray-700"
              strokeWidth="4"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              className="fill-none stroke-gray-500 dark:stroke-gray-400"
              strokeWidth="4"
              strokeDasharray={`${(task.progress ?? 0) * 1.005}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-xs font-bold text-gray-700 dark:text-gray-200">
            {task.progress ?? 0}%
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {task.title ?? task.name ?? `Tâche #${task.id}`}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {/* status badge */}
            <Badge color={statusBadgeColor(task.status)} className="gap-2">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  STATUS.find((s) => s.key === task.status)?.dotColor ||
                  "bg-blue-500"
                }`}
              />
              {STATUS.find((s) => s.key === task.status)?.label || "Statut"}
            </Badge>
            {/* category badge */}
            <Badge color="primary" className="gap-2">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {(task.category || "Général").toUpperCase()}
            </Badge>
            {/* due date badge */}
            {formatDate(task.due_at) && (
              <Badge color="gray" className="gap-2">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(task.due_at)}
              </Badge>
            )}
          </div>
        </div>
        <RequirePermission perm="tasks.manage" fallback={null}>
          <div className="ml-auto flex items-center gap-1">
            <button
              title="Modifier"
              onClick={onEdit}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5h2m6 14H5a2 2 0 01-2-2V7a2 2 0 012-2h7l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2z"
                />
              </svg>
            </button>
            <button
              title="Supprimer"
              onClick={onRequestDelete}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-rose-600 dark:text-rose-400"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-3H10a1 1 0 00-1 1v1h8V5a1 1 0 00-1-1z"
                />
              </svg>
            </button>
          </div>
        </RequirePermission>
      </div>

      {/* Assignees */}
      {Array.isArray(task.assignees) && task.assignees.length > 0 && (
        <div className="flex -space-x-2 mt-3">
          {task.assignees.slice(0, 5).map((u, idx) => (
            <div
              key={u.id || idx}
              title={`${u.name || u.email}`}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-[10px] font-bold"
            >
              {initials(u.name || u.email)}
            </div>
          ))}
          {task.assignees.length > 5 && (
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[10px] font-bold">
              +{task.assignees.length - 5}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Assignees list */}
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
              onClick={onStart}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-white/80"></span>
              <span>Démarrer</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onStop}
              className="w-full px-3 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Arrêter</span>
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
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => assignee && onAssign(assignee)}
              disabled={!assignee}
              className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              OK
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
              className="flex-1 accent-gray-500"
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

function CreateTaskModal({ onClose, onSave, saving, clients, users, initial }) {
  const [form, setForm] = React.useState(() => ({
    client_id: initial?.client_id ?? clients[0]?.id ?? "",
    owner_id: initial?.owner_id ? String(initial.owner_id) : "",
    category: initial?.category ?? "COMPTABLE",
    nature: initial?.nature ?? "CONTINUE",
    status: initial?.status ?? "EN_ATTENTE",
    priority: initial?.priority ?? 0,
    progress: initial?.progress ?? 0,
    starts_at: initial?.starts_at ?? "",
    due_at: initial?.due_at ?? "",
    notes: initial?.notes ?? "",
  }));

  function update(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    const payload = { ...form };
    // Convert empty strings to null for optional fields
    if (!payload.owner_id) payload.owner_id = null;
    if (!payload.starts_at) payload.starts_at = null;
    if (!payload.due_at) payload.due_at = null;
    if (!payload.notes) payload.notes = null;
    onSave(payload);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial?.id ? "Modifier la tâche" : "Créer une nouvelle tâche"}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            onClick={onClose}
            className="!from-gray-200 !to-gray-300 !text-gray-800"
          >
            Annuler
          </Button>
          <Button onClick={submit} disabled={saving || !form.client_id}>
            {saving
              ? "Enregistrement..."
              : initial?.id
              ? "Enregistrer"
              : "Créer"}
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.client_id}
              onChange={(e) => update("client_id", e.target.value)}
              options={[
                { value: "", label: "Sélectionner un client" },
                ...clients.map((c) => ({
                  value: String(c.id),
                  label: c.raison_sociale || `Client #${c.id}`,
                })),
              ]}
              required
            />
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsable
            </label>
            <Select
              value={form.owner_id}
              onChange={(e) => update("owner_id", e.target.value)}
              options={[
                { value: "", label: "Aucun" },
                ...users.map((u) => ({
                  value: String(u.id),
                  label: u.name || u.email || `User #${u.id}`,
                })),
              ]}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              required
            />
          </div>

          {/* Nature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nature <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.nature}
              onChange={(e) => update("nature", e.target.value)}
              options={NATURES.map((n) => ({ value: n, label: n }))}
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <Select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              options={STATUS.map((s) => ({ value: s.key, label: s.label }))}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorité (0-5)
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={form.priority}
              onChange={(e) => update("priority", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progression (0-100%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.progress}
              onChange={(e) => update("progress", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={form.starts_at}
              onChange={(e) => update("starts_at", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'échéance
            </label>
            <input
              type="date"
              value={form.due_at}
              onChange={(e) => update("due_at", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Ajoutez des notes sur cette tâche..."
          />
        </div>
      </form>
    </Modal>
  );
}
