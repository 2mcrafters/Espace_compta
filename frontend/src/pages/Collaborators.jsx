import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from "framer-motion";
import api from "../lib/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import RequirePermission from "../components/RequirePermission";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toaster";

function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await api.get("/users");
        return response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
  });
}

function useStats(userId) {
  return useQuery({
    queryKey: ["user-stats", userId],
    queryFn: async () => {
      try {
        const response = await api.get(`/users/${userId}/stats`);
        return response.data;
      } catch (error) {
        // Silently fail for stats if no permission
        if (error.response?.status === 403) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!userId,
    retry: false,
  });
}

export default function Collaborators() {
  const qc = useQueryClient();
  const { data: users = [], isLoading, error } = useUsers();
  const [editing, setEditing] = React.useState(null);
  const [rateUser, setRateUser] = React.useState(null);
  const [creating, setCreating] = React.useState(false);

  const saveMutation = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      try {
        const response = await api.put(`/users/${id}`, payload);
        return response.data;
      } catch (error) {
        console.error("Error saving user:", error);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setEditing(null);
    },
    onError: (error) => {
      alert(
        `Erreur: ${
          error.response?.data?.message ||
          error.message ||
          "Impossible de sauvegarder"
        }`
      );
    },
  });

  const rateMutation = useMutation({
    mutationFn: async ({ id, hourly_rate_mad, effective_from }) => {
      try {
        const response = await api.post(`/users/${id}/rate`, {
          hourly_rate_mad,
          effective_from,
        });
        return response.data;
      } catch (error) {
        console.error("Error setting rate:", error);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["user-stats"] });
      setRateUser(null);
    },
    onError: (error) => {
      const message =
        error.response?.status === 403
          ? "Vous n'avez pas la permission de modifier les taux horaires"
          : error.response?.data?.message ||
            error.message ||
            "Impossible de définir le taux";
      alert(`Erreur: ${message}`);
    },
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-2">
              Collaborateurs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez vos collaborateurs et leurs informations
            </p>
          </div>
          <RequirePermission perm="users.edit" fallback={null}>
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
              Nouvel utilisateur
            </Button>
          </RequirePermission>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
        >
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm">
            {error.response?.data?.message ||
              error.message ||
              "Impossible de charger les collaborateurs"}
          </p>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-20 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fonction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Objectif mensuel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Taux horaire
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg
                          className="w-16 h-16 mb-3 opacity-50"
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
                        <p className="font-medium">Aucun collaborateur</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <Row
                      key={u.id}
                      user={u}
                      index={i}
                      onEdit={() => setEditing(u)}
                      onSetRate={() => setRateUser(u)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(payload) => saveMutation.mutate(payload)}
          saving={saveMutation.isPending}
        />
      )}
      {rateUser && (
        <SetRateModal
          user={rateUser}
          onClose={() => setRateUser(null)}
          onSave={(payload) => rateMutation.mutate(payload)}
          saving={rateMutation.isPending}
        />
      )}
      {creating && (
        <CreateUserModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            qc.invalidateQueries({ queryKey: ["users"] });
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function Row({ user, index, onEdit, onSetRate }) {
  const { data: stats, error: statsError } = useStats(user.id);
  const hasStatsPermission =
    !statsError || statsError?.response?.status !== 403;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        backgroundColor: "rgba(243, 244, 246, 0.8)",
        scale: 1.005,
      }}
      className="transition-all duration-300 relative group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold mr-3">
            {(
              user.first_name?.[0] ||
              user.last_name?.[0] ||
              user.name?.[0] ||
              "U"
            ).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.first_name || user.last_name
                ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                : user.name}
            </div>
            <div className="text-xs text-gray-500">
              {user.internal_id || "—"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600">{user.job_title || "—"}</td>
      <td className="px-6 py-4 text-gray-600">{user.email}</td>
      <td className="px-6 py-4 text-gray-600">{user.phone || "—"}</td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
          {user.monthly_hours_target || "—"} h
        </span>
      </td>
      <td className="px-6 py-4">
        <RequirePermission
          perm="users.rate"
          fallback={<span className="text-gray-400 text-sm">•••</span>}
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
            {user.hourly_rate_mad
              ? `${Number(user.hourly_rate_mad).toFixed(2)} MAD`
              : "—"}
          </span>
        </RequirePermission>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex gap-2 justify-end">
          <RequirePermission perm="users.edit" fallback={null}>
            <motion.button
              whileHover={{
                scale: 1.05,
                y: -2,
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium transition-all duration-300 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
              <span className="relative">Modifier</span>
            </motion.button>
          </RequirePermission>
          <RequirePermission perm="users.rate" fallback={null}>
            <motion.button
              whileHover={{
                scale: 1.05,
                y: -2,
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onSetRate}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium transition-all duration-300 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
              <span className="relative">Taux horaire</span>
            </motion.button>
          </RequirePermission>
        </div>
        {hasStatsPermission && (
          <div className="text-xs text-gray-500 mt-2">
            Ce mois: {stats?.minutes_month ?? "0"} min · Cette année:{" "}
            {stats?.minutes_year ?? "0"} min
          </div>
        )}
      </td>
    </motion.tr>
  );
}

function EditUserModal({ user, onClose, onSave, saving }) {
  const [form, setForm] = React.useState({ ...user });
  function update(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
  }
  function submit() {
    onSave({ id: user.id, ...form });
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={`Modifier ${user.name}`}
      footer={
        <div className="flex gap-2">
          <Button
            onClick={onClose}
            className="!from-gray-200 !to-gray-300 !text-gray-800"
          >
            Annuler
          </Button>
          <Button onClick={submit} disabled={saving}>
            Enregistrer
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Prénom"
          value={form.first_name || ""}
          onChange={(e) => update("first_name", e.target.value)}
        />
        <Input
          label="Nom"
          value={form.last_name || ""}
          onChange={(e) => update("last_name", e.target.value)}
        />
        <Input
          label="Email"
          value={form.email || ""}
          onChange={(e) => update("email", e.target.value)}
        />
        <Input
          label="Téléphone"
          value={form.phone || ""}
          onChange={(e) => update("phone", e.target.value)}
        />
        <Input
          label="Identifiant interne"
          value={form.internal_id || ""}
          onChange={(e) => update("internal_id", e.target.value)}
        />
        <Input
          label="Fonction"
          value={form.job_title || ""}
          onChange={(e) => update("job_title", e.target.value)}
        />
        <Input
          label="Objectif mensuel (h)"
          type="number"
          step="0.01"
          value={form.monthly_hours_target || ""}
          onChange={(e) => update("monthly_hours_target", e.target.value)}
        />
        <Input
          label="Objectif annuel (h)"
          type="number"
          step="0.01"
          value={form.yearly_hours_target || ""}
          onChange={(e) => update("yearly_hours_target", e.target.value)}
        />
      </div>
    </Modal>
  );
}

function SetRateModal({ user, onClose, onSave, saving }) {
  const [rate, setRate] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  function submit() {
    onSave({
      id: user.id,
      hourly_rate_mad: Number(rate),
      effective_from: date,
    });
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={`Taux horaire • ${user.name}`}
      footer={
        <div className="flex gap-2">
          <Button
            onClick={onClose}
            className="!from-gray-200 !to-gray-300 !text-gray-800"
          >
            Annuler
          </Button>
          <Button onClick={submit} disabled={saving || !rate}>
            Enregistrer
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Taux (MAD/h)"
          type="number"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <Input
          label="Date d'effet"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <p className="text-sm text-gray-500 md:col-span-2">
          Seuls les rôles autorisés peuvent consulter/modifier le taux horaire.
        </p>
      </div>
    </Modal>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    internal_id: "",
    job_title: "",
    monthly_hours_target: "",
    yearly_hours_target: "",
    password: "",
    roles: [],
    hourly_rate_mad: "",
    hourly_rate_effective_from: new Date().toISOString().slice(0, 10),
    send_invite: false,
  });
  const [errors, setErrors] = React.useState({});
  const { data: rolesPerms } = useQuery({
    queryKey: ["roles-permissions"],
    queryFn: async () => (await api.get("/roles-permissions")).data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/users", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Utilisateur créé avec succès");
      setErrors({});
      onCreated?.();
    },
    onError: (error) => {
      const resp = error.response;
      if (resp?.status === 422 && resp.data?.errors) {
        setErrors(resp.data.errors || {});
        toast.error("Veuillez corriger les erreurs du formulaire");
      } else if (resp?.status === 403) {
        toast.error("Vous n'avez pas la permission de créer un utilisateur");
      } else {
        toast.error(
          resp?.data?.message ||
            error.message ||
            "Impossible de créer l'utilisateur"
        );
      }
    },
  });

  function update(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
  }
  function toggleRole(name) {
    setForm((s) => ({
      ...s,
      roles: s.roles.includes(name)
        ? s.roles.filter((r) => r !== name)
        : [...s.roles, name],
    }));
  }
  function submit(e) {
    e.preventDefault();
    setErrors({});
    const payload = { ...form };
    payload.monthly_hours_target =
      payload.monthly_hours_target === ""
        ? null
        : Number(payload.monthly_hours_target);
    payload.yearly_hours_target =
      payload.yearly_hours_target === ""
        ? null
        : Number(payload.yearly_hours_target);
    if (payload.hourly_rate_mad === "") delete payload.hourly_rate_mad;
    // If sending invite, drop password so backend can ignore/auto-generate
    if (payload.send_invite && payload.password === "") {
      delete payload.password;
    }
    createMutation.mutate(payload);
  }

  const roles = rolesPerms?.roles?.map((r) => r.name) ?? [];

  return (
    <Modal
      open
      onClose={onClose}
      title="Créer un utilisateur"
      footer={
        <div className="flex gap-2">
          <Button
            onClick={onClose}
            className="!from-gray-200 !to-gray-300 !text-gray-800"
          >
            Annuler
          </Button>
          <Button
            onClick={submit}
            disabled={
              createMutation.isPending ||
              !form.email ||
              (!form.send_invite && !form.password)
            }
          >
            Créer
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Prénom"
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            error={errors.first_name?.[0]}
          />
          <Input
            label="Nom"
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            error={errors.last_name?.[0]}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            error={errors.email?.[0]}
          />
          <Input
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required={!form.send_invite}
            disabled={form.send_invite}
            placeholder={form.send_invite ? "Sera défini par l'invité" : ""}
            error={errors.password?.[0]}
          />
          <Input
            label="Téléphone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            error={errors.phone?.[0]}
          />
          <Input
            label="Identifiant interne"
            value={form.internal_id}
            onChange={(e) => update("internal_id", e.target.value)}
            error={errors.internal_id?.[0]}
          />
          <Input
            label="Fonction"
            value={form.job_title}
            onChange={(e) => update("job_title", e.target.value)}
            error={errors.job_title?.[0]}
          />
          <Input
            label="Objectif mensuel (h)"
            type="number"
            step="0.01"
            value={form.monthly_hours_target}
            onChange={(e) => update("monthly_hours_target", e.target.value)}
            error={errors.monthly_hours_target?.[0]}
          />
          <Input
            label="Objectif annuel (h)"
            type="number"
            step="0.01"
            value={form.yearly_hours_target}
            onChange={(e) => update("yearly_hours_target", e.target.value)}
            error={errors.yearly_hours_target?.[0]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Taux (MAD/h)"
            type="number"
            step="0.01"
            value={form.hourly_rate_mad}
            onChange={(e) => update("hourly_rate_mad", e.target.value)}
            error={errors.hourly_rate_mad?.[0]}
          />
          <Input
            label="Date d'effet"
            type="date"
            value={form.hourly_rate_effective_from}
            onChange={(e) =>
              update("hourly_rate_effective_from", e.target.value)
            }
            error={errors.hourly_rate_effective_from?.[0]}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input
            type="checkbox"
            checked={form.send_invite}
            onChange={(e) => update("send_invite", e.target.checked)}
          />
          Envoyer un email d'invitation (l'utilisateur définira son mot de
          passe)
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Rôles
          </label>
          <div className="flex flex-wrap gap-2">
            {roles.length === 0 ? (
              <span className="text-sm text-gray-500">
                Chargement des rôles...
              </span>
            ) : (
              roles.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => toggleRole(name)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    form.roles.includes(name)
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {name}
                </button>
              ))
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
