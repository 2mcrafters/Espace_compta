import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { useSelector } from 'react-redux'
import { selectUser } from '../store/redux/store'
import RequirePermission from '../components/RequirePermission'
import ConfirmDialog from '../components/ui/ConfirmDialog'

function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients')
      return data?.data ?? data
    }
  })
}

function usePortfolios() {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => (await api.get('/portfolios')).data,
  })
}

export default function Clients() {
  const qc = useQueryClient();
  const user = useSelector(selectUser);
  const { data: clients = [], isLoading } = useClients();
  const { data: portfolios = [] } = usePortfolios();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null);
  const [docsClient, setDocsClient] = React.useState(null);
  const [collabClient, setCollabClient] = React.useState(null);

  const canSeeContract = true;

  const saveMutation = useMutation({
    mutationFn: async (values) => {
      const {
        rc_file,
        if_file,
        ice_file,
        forme_juridique_file,
        id,
        ...payload
      } = values || {};

      // Create or update client
      const res = id
        ? await api.put(`/clients/${id}`, payload)
        : await api.post("/clients", payload);
      const saved = res.data;
      const clientId = saved?.id || id;

      // Upload optional files
      const uploads = [];
      const mapping = [
        { file: rc_file, category: "RC" },
        { file: if_file, category: "IF" },
        { file: ice_file, category: "ICE" },
        { file: forme_juridique_file, category: "Forme juridique" },
      ];
      for (const m of mapping) {
        if (m.file) {
          const fd = new FormData();
          fd.append("file", m.file);
          fd.append("category", m.category);
          fd.append("title", m.file.name);
          uploads.push(
            api.post(`/clients/${clientId}/documents`, fd, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          );
        }
      }
      if (uploads.length) await Promise.allSettled(uploads);

      return saved;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/clients/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setConfirm(null);
    },
  });

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(row) {
    setEditing(row);
    setOpen(true);
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          Clients
        </h2>
        <RequirePermission perm="clients.edit" fallback={null}>
          <Button onClick={openCreate}>Ajouter un client</Button>
        </RequirePermission>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100">
              <thead className="bg-gray-50 dark:bg-gray-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  {canSeeContract && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contrat
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {clients?.map?.((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold mr-3 shadow-lg">
                          {row.raison_sociale?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {row.raison_sociale}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {row.email || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {row.telephone || "—"}
                    </td>
                    {canSeeContract && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
                          {row.montant_contrat
                            ? `${parseFloat(
                                row.montant_contrat
                              ).toLocaleString()} €`
                            : "—"}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <motion.button
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setDocsClient(row)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium transition-all duration-300 relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                          <span className="relative">Documents</span>
                        </motion.button>
                        <RequirePermission perm="clients.edit" fallback={null}>
                          <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setCollabClient(row)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium transition-all duration-300 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                            <span className="relative">Collaborateurs</span>
                          </motion.button>
                        </RequirePermission>
                        <RequirePermission perm="clients.edit" fallback={null}>
                          <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => openEdit(row)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium transition-all duration-300 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                            <span className="relative">Modifier</span>
                          </motion.button>
                        </RequirePermission>
                        <RequirePermission perm="clients.edit" fallback={null}>
                          <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setConfirm(row)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium transition-all duration-300 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                            <span className="relative">Supprimer</span>
                          </motion.button>
                        </RequirePermission>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <ClientFormModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        portfolios={portfolios}
        client={editing}
        onSubmit={(values) => saveMutation.mutate(values)}
        saving={saveMutation.isPending}
      />

      <ConfirmDialog
        open={!!confirm}
        title="Supprimer le client"
        description={`Êtes-vous sûr de vouloir supprimer ${confirm?.raison_sociale} ?`}
        onCancel={() => setConfirm(null)}
        onConfirm={() => deleteMutation.mutate(confirm.id)}
      />

      <ClientDocumentsModal
        client={docsClient}
        onClose={() => setDocsClient(null)}
      />
      <ClientCollaboratorsModal
        client={collabClient}
        onClose={() => setCollabClient(null)}
      />
    </div>
  );
}
function ClientCollaboratorsModal({ client, onClose }) {
  const open = !!client;
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({
    queryKey: ["users-lookup"],
    queryFn: async () => (await api.get("/users/lookup")).data,
    enabled: open,
  });
  const { data: collabs = [] } = useQuery({
    queryKey: ["client-collabs", client?.id],
    queryFn: async () =>
      (await api.get(`/clients/${client.id}/collaborators`)).data,
    enabled: open,
  });

  const attachMutation = useMutation({
    mutationFn: async (user_id) =>
      (await api.post(`/clients/${client.id}/collaborators`, { user_id })).data,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["client-collabs", client?.id] }),
  });
  const detachMutation = useMutation({
    mutationFn: async (user_id) =>
      (await api.delete(`/clients/${client.id}/collaborators/${user_id}`)).data,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["client-collabs", client?.id] }),
  });
  const [confirmDetach, setConfirmDetach] = React.useState(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        client ? `Collaborateurs • ${client.raison_sociale}` : "Collaborateurs"
      }
      footer={
        <div className="flex gap-2">
          <Button
            onClick={onClose}
            className="!from-gray-200 !to-gray-300 !text-gray-800"
          >
            Fermer
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Tous les utilisateurs</h4>
          <ul className="divide-y">
            {users.map((u) => (
              <li key={u.id} className="py-2 flex items-center justify-between">
                <span>
                  {u.name}{" "}
                  <span className="text-gray-500 text-xs">({u.email})</span>
                </span>
                <Button
                  onClick={() => attachMutation.mutate(u.id)}
                  className="!from-blue-500 !to-blue-600"
                >
                  Ajouter
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Collaborateurs du client</h4>
          <ul className="divide-y">
            {collabs.map((u) => (
              <li key={u.id} className="py-2 flex items-center justify-between">
                <span>
                  {u.name}{" "}
                  <span className="text-gray-500 text-xs">({u.email})</span>
                </span>
                <Button
                  onClick={() => setConfirmDetach(u)}
                  className="!from-red-500 !to-red-600"
                >
                  Retirer
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ConfirmDialog
        open={!!confirmDetach}
        title="Retirer le collaborateur"
        description={
          confirmDetach
            ? `Retirer ${confirmDetach.name} du client ${client?.raison_sociale} ?`
            : ""
        }
        onCancel={() => setConfirmDetach(null)}
        onConfirm={() => {
          if (confirmDetach) {
            detachMutation.mutate(confirmDetach.id);
            setConfirmDetach(null);
          }
        }}
      />
    </Modal>
  );
}

function ClientFormModal({
  open,
  onClose,
  client,
  onSubmit,
  saving,
  portfolios = [],
}) {
  const empty = {
    portfolio_id: portfolios?.[0]?.id || "",
    raison_sociale: "",
    email: "",
    telephone: "",
    montant_contrat: "",
    adresse: "",
    forme_juridique: "",
    statut_juridique: "",
    date_creation: "",
    capital_social: "",
    regime_fiscal: "",
    date_debut_collaboration: "",
    responsable_client: "",
    type_mission: "",
    rc: "",
    if: "",
    ice: "",
    rc_file: null,
    if_file: null,
    ice_file: null,
    forme_juridique_file: null,
  };
  const [form, setForm] = React.useState(client || empty);
  React.useEffect(() => {
    setForm(client || empty);
  }, [client, portfolios]);

  // Choose per-field input mode: 'text' or 'file' for RC/IF/ICE/Forme juridique
  const [modes, setModes] = React.useState({
    rc: "text",
    if: "text",
    ice: "text",
    forme: "text",
  });
  React.useEffect(() => {
    setModes({
      rc: "text",
      if: "text",
      ice: "text",
      forme: "text",
    });
  }, [client]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function setMode(key, mode) {
    setModes((prev) => ({ ...prev, [key]: mode }));
    if (mode === "text") {
      if (key === "rc") update("rc_file", null);
      if (key === "if") update("if_file", null);
      if (key === "ice") update("ice_file", null);
      if (key === "forme") update("forme_juridique_file", null);
    } else {
      if (key === "rc") update("rc", "");
      if (key === "if") update("if", "");
      if (key === "ice") update("ice", "");
      if (key === "forme") update("forme_juridique", "");
    }
  }
  function submit(e) {
    e.preventDefault();
    // Ensure only one of text/file is submitted per field
    const payload = { ...form };
    if (modes.rc === "text") payload.rc_file = null;
    else payload.rc = "";
    if (modes.if === "text") payload.if_file = null;
    else payload.if = "";
    if (modes.ice === "text") payload.ice_file = null;
    else payload.ice = "";
    if (modes.forme === "text") payload.forme_juridique_file = null;
    else payload.forme_juridique = "";
    onSubmit?.(payload);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client?.id ? "Modifier le client" : "Ajouter un client"}
      className="max-w-4xl"
      footer={
        <div className="flex gap-3">
          <motion.button
            whileHover={{
              scale: 1.02,
              borderColor: "rgb(156, 163, 175)",
            }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-lg border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
            onClick={onClose}
          >
            Annuler
          </motion.button>
          <RequirePermission perm="clients.edit" fallback={null}>
            <Button disabled={saving} onClick={submit}>
              {saving ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </RequirePermission>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-6">
        {/* Liaison */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-gradient-to-b from-primary-400 to-primary-600 rounded" />
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Liaison
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Portefeuille
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                value={form.portfolio_id}
                onChange={(e) => update("portfolio_id", e.target.value)}
                required
              >
                <option value="" disabled>
                  Sélectionner...
                </option>
                {portfolios?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Raison sociale"
              value={form.raison_sociale}
              onChange={(e) => update("raison_sociale", e.target.value)}
              required
            />
          </div>
        </div>

        {/* Coordonnées */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-gradient-to-b from-primary-400 to-primary-600 rounded" />
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Coordonnées
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Adresse"
              value={form.adresse}
              onChange={(e) => update("adresse", e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <Input
              label="Téléphone"
              value={form.telephone}
              onChange={(e) => update("telephone", e.target.value)}
            />
            <Input
              label="Responsable client"
              value={form.responsable_client}
              onChange={(e) => update("responsable_client", e.target.value)}
            />
          </div>
        </div>

        {/* Informations légales */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-gradient-to-b from-primary-400 to-primary-600 rounded" />
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Informations légales
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RC */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  RC
                </label>
                <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMode("rc", "text")}
                    className={`px-2.5 py-1 text-xs ${
                      modes.rc === "text"
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Texte
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("rc", "file")}
                    className={`px-2.5 py-1 text-xs ${
                      modes.rc === "file"
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Fichier
                  </button>
                </div>
              </div>
              {modes.rc === "text" ? (
                <Input
                  label="RC (texte)"
                  value={form.rc || ""}
                  onChange={(e) => update("rc", e.target.value)}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    RC (fichier)
                  </label>
                  <label className="flex items-center justify-center border-2 border-dashed rounded-lg py-7 px-3 text-sm text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                    <input
                      className="hidden"
                      type="file"
                      onChange={(e) =>
                        update("rc_file", e.target.files?.[0] || null)
                      }
                    />
                    {form.rc_file ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="truncate">{form.rc_file.name}</span>
                        <button
                          type="button"
                          className="text-red-600 dark:text-red-400 text-xs"
                          onClick={() => update("rc_file", null)}
                        >
                          Retirer
                        </button>
                      </div>
                    ) : (
                      <span>Glisser-déposer ou cliquer pour choisir</span>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* IF */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  IF
                </label>
                <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMode("if", "text")}
                    className={`px-2.5 py-1 text-xs ${
                      modes.if === "text"
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Texte
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("if", "file")}
                    className={`px-2.5 py-1 text-xs ${
                      modes.if === "file"
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Fichier
                  </button>
                </div>
              </div>
              {modes.if === "text" ? (
                <Input
                  label="IF (texte)"
                  value={form.if || ""}
                  onChange={(e) => update("if", e.target.value)}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IF (fichier)
                  </label>
                  <label className="flex items-center justify-center border-2 border-dashed rounded-lg py-7 px-3 text-sm text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                    <input
                      className="hidden"
                      type="file"
                      onChange={(e) =>
                        update("if_file", e.target.files?.[0] || null)
                      }
                    />
                    {form.if_file ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="truncate">{form.if_file.name}</span>
                        <button
                          type="button"
                          className="text-red-600 dark:text-red-400 text-xs"
                          onClick={() => update("if_file", null)}
                        >
                          Retirer
                        </button>
                      </div>
                    ) : (
                      <span>Glisser-déposer ou cliquer pour choisir</span>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* ICE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ICE
                </label>
                <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMode("ice", "text")}
                    className={`px-2.5 py-1 text-xs ${
                      modes.ice === "text"
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Texte
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("ice", "file")}
                    className={`px-2.5 py-1 text-xs ${
                      modes.ice === "file"
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Fichier
                  </button>
                </div>
              </div>
              {modes.ice === "text" ? (
                <Input
                  label="ICE (texte)"
                  value={form.ice || ""}
                  onChange={(e) => update("ice", e.target.value)}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ICE (fichier)
                  </label>
                  <label className="flex items-center justify-center border-2 border-dashed rounded-lg py-7 px-3 text-sm text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                    <input
                      className="hidden"
                      type="file"
                      onChange={(e) =>
                        update("ice_file", e.target.files?.[0] || null)
                      }
                    />
                    {form.ice_file ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="truncate">{form.ice_file.name}</span>
                        <button
                          type="button"
                          className="text-red-600 dark:text-red-400 text-xs"
                          onClick={() => update("ice_file", null)}
                        >
                          Retirer
                        </button>
                      </div>
                    ) : (
                      <span>Glisser-déposer ou cliquer pour choisir</span>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Forme juridique */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Forme juridique
                </label>
                <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMode("forme", "text")}
                    className={`px-2.5 py-1 text-xs ${
                      modes.forme === "text"
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Texte
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("forme", "file")}
                    className={`px-2.5 py-1 text-xs ${
                      modes.forme === "file"
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Fichier
                  </button>
                </div>
              </div>
              {modes.forme === "text" ? (
                <Input
                  label="Forme juridique (texte)"
                  value={form.forme_juridique}
                  onChange={(e) => update("forme_juridique", e.target.value)}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Forme juridique (fichier)
                  </label>
                  <label className="flex items-center justify-center border-2 border-dashed rounded-lg py-7 px-3 text-sm text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                    <input
                      className="hidden"
                      type="file"
                      onChange={(e) =>
                        update(
                          "forme_juridique_file",
                          e.target.files?.[0] || null
                        )
                      }
                    />
                    {form.forme_juridique_file ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="truncate">
                          {form.forme_juridique_file.name}
                        </span>
                        <button
                          type="button"
                          className="text-red-600 dark:text-red-400 text-xs"
                          onClick={() => update("forme_juridique_file", null)}
                        >
                          Retirer
                        </button>
                      </div>
                    ) : (
                      <span>Glisser-déposer ou cliquer pour choisir</span>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Other legal details */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Statut juridique"
                value={form.statut_juridique}
                onChange={(e) => update("statut_juridique", e.target.value)}
              />
              <Input
                label="Date de création"
                type="date"
                value={form.date_creation || ""}
                onChange={(e) => update("date_creation", e.target.value)}
              />
              <Input
                label="Régime fiscal"
                value={form.regime_fiscal}
                onChange={(e) => update("regime_fiscal", e.target.value)}
              />
              <Input
                label="Capital social"
                type="number"
                step="0.01"
                value={form.capital_social || ""}
                onChange={(e) => update("capital_social", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Opérationnel */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-gradient-to-b from-primary-400 to-primary-600 rounded" />
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Opérationnel
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Début de collaboration"
              type="date"
              value={form.date_debut_collaboration || ""}
              onChange={(e) =>
                update("date_debut_collaboration", e.target.value)
              }
            />
            <Input
              label="Type de mission"
              value={form.type_mission}
              onChange={(e) => update("type_mission", e.target.value)}
            />
            <Input
              label="Montant contrat (€)"
              type="number"
              step="0.01"
              value={form.montant_contrat ?? ""}
              onChange={(e) => update("montant_contrat", e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

function ClientDocumentsModal({ client, onClose }) {
  const open = !!client
  const qc = useQueryClient()
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['client-docs', client?.id],
    queryFn: async () => {
      if (!client?.id) return []
      const { data } = await api.get(`/clients/${client.id}/documents`)
      return data
    },
    enabled: !!client?.id,
  })

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category, title, is_confidential }) => {
      const fd = new FormData()
      fd.append('file', file)
      if (category) fd.append('category', category)
      if (title) fd.append('title', title)
      if (is_confidential) fd.append('is_confidential', '1')
      const { data } = await api.post(`/clients/${client.id}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-docs', client?.id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (docId) => {
      await api.delete(`/clients/${client.id}/documents/${docId}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-docs', client?.id] }),
  })
  const [confirmDoc, setConfirmDoc] = React.useState(null)

  const [file, setFile] = React.useState(null)
  const [category, setCategory] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [isConf, setIsConf] = React.useState(false)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? `Documents - ${client.raison_sociale}` : 'Documents'}
      footer={
        <div className="flex gap-3">
          <Button onClick={onClose} className="!from-gray-200 !to-gray-300 !text-gray-800">
            Fermer
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <Input label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <input type="checkbox" checked={isConf} onChange={(e) => setIsConf(e.target.checked)} /> Confidential
            </label>
            <Button
              disabled={!file || uploadMutation.isPending}
              onClick={() => uploadMutation.mutate({ file, category, title, is_confidential: isConf })}
            >
              Téléverser
            </Button>
          </div>
        </div>
        <div className="border-t pt-4">
          {isLoading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : docs.length === 0 ? (
            <p className="text-gray-500">Aucun document</p>
          ) : (
            <ul className="divide-y">
              {docs.map((d) => (
                <li key={d.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{d.title}</p>
                    <p className="text-xs text-gray-500">{d.category || '—'} · {(d.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm"
                      href={`${import.meta.env.VITE_BACKEND_URL || ''}/api/clients/${client.id}/documents/${d.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Télécharger
                    </a>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setConfirmDoc(d)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm"
                    >
                      Supprimer
                    </motion.button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ConfirmDialog
          open={!!confirmDoc}
          title="Supprimer le document"
          description={confirmDoc ? `Supprimer le document "${confirmDoc.title}" ?` : ''}
          onCancel={() => setConfirmDoc(null)}
          onConfirm={() => {
            if (confirmDoc) {
              deleteMutation.mutate(confirmDoc.id)
              setConfirmDoc(null)
            }
          }}
        />
      </div>
    </Modal>
  )
}
// Removed duplicate, corrupted ClientDocumentsModal definition
