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
    queryKey: ["portfolios"],
    queryFn: async () => {
      const { data } = await api.get("/portfolios");
      return data;
    },
  });
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

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      // Normalize fields
      const body = { ...payload };
      // associes: accept JSON string -> array
      if (typeof body.associes === "string" && body.associes.trim() !== "") {
        try {
          body.associes = JSON.parse(body.associes);
        } catch {
          /* keep as string if invalid */
        }
      }
      // numbers
      if (body.montant_contrat !== undefined && body.montant_contrat !== "")
        body.montant_contrat = Number(body.montant_contrat);
      if (body.capital_social !== undefined && body.capital_social !== "")
        body.capital_social = Number(body.capital_social);
      // dates: keep as yyyy-mm-dd strings (backend casts)
      if (payload.id) {
        const { id, ...rest } = body;
        const { data } = await api.put(`/clients/${id}`, rest);
        return data;
      } else {
        const { data } = await api.post("/clients", body);
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setConfirm(null);
    },
  });

  function openCreate() {
    setEditing({
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
      associes: "",
      regime_fiscal: "",
      date_debut_collaboration: "",
      responsable_client: "",
      type_mission: "",
    });
    setOpen(true);
  }
  function openEdit(row) {
    setEditing({
      ...row,
      associes: Array.isArray(row.associes)
        ? JSON.stringify(row.associes)
        : row.associes ?? "",
    });
    setOpen(true);
  }

  const canSeeContract =
    !!user &&
    Array.isArray(user.roles) &&
    user.roles.some((r) => ["ADMIN", "CHEF_EQUIPE"].includes(r));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Clients
          </h1>
          <p className="text-gray-600">
            Gérez vos clients et leurs informations
          </p>
        </div>
        <RequirePermission perm="clients.edit" fallback={null}>
          <Button
            onClick={openCreate}
            className="!from-primary-500 !to-primary-700"
          >
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
            Ajouter un client
          </Button>
        </RequirePermission>
      </motion.div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-16 bg-gray-200 rounded-xl animate-pulse"
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
                    Raison sociale
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Téléphone
                  </th>
                  {canSeeContract && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Montant contrat
                    </th>
                  )}
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canSeeContract ? 5 : 4}
                      className="px-6 py-12 text-center"
                    >
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
                        <p className="font-medium">Aucun client</p>
                        <p className="text-sm">
                          Cliquez sur "Ajouter un client" pour commencer
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{
                        backgroundColor: "rgba(243, 244, 246, 0.8)",
                        scale: 1.01,
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                      }}
                      className="transition-all duration-300 cursor-pointer relative group"
                    >
                      {/* Hover indicator */}
                      <motion.td
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold mr-3 shadow-lg">
                            {row.raison_sociale?.charAt(0)?.toUpperCase() ||
                              "C"}
                          </div>
                          <div className="font-medium text-gray-900">
                            {row.raison_sociale}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {row.email || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
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
                            whileHover={{
                              scale: 1.05,
                              y: -2,
                              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.35)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDocsClient(row)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium shadow-md transition-all duration-300 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                            <span className="relative">Documents</span>
                          </motion.button>
                          <RequirePermission
                            perm="clients.edit"
                            fallback={null}
                          >
                            <motion.button
                              whileHover={{
                                scale: 1.05,
                                y: -2,
                                boxShadow:
                                  "0 10px 25px rgba(59, 130, 246, 0.35)",
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setCollabClient(row)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium shadow-md transition-all duration-300 relative overflow-hidden group"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                              <span className="relative">Collaborateurs</span>
                            </motion.button>
                            <RequirePermission
                              perm="clients.edit"
                              fallback={null}
                            >
                              <motion.button
                                whileHover={{
                                  scale: 1.05,
                                  y: -2,
                                  boxShadow:
                                    "0 10px 25px rgba(75, 85, 99, 0.4)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openEdit(row)}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium shadow-md transition-all duration-300 relative overflow-hidden group"
                              >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                                <span className="relative">Modifier</span>
                              </motion.button>
                            </RequirePermission>
                          </RequirePermission>
                          <RequirePermission
                            perm="clients.edit"
                            fallback={null}
                          >
                            <motion.button
                              whileHover={{
                                scale: 1.05,
                                y: -2,
                                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.4)",
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setConfirm(row)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium shadow-md transition-all duration-300 relative overflow-hidden group"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                              <span className="relative">Supprimer</span>
                            </motion.button>
                          </RequirePermission>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
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
    associes: "",
    regime_fiscal: "",
    date_debut_collaboration: "",
    responsable_client: "",
    type_mission: "",
    rc: "",
    if: "",
    ice: "",
  };
  const [form, setForm] = React.useState(client || empty);
  React.useEffect(() => {
    setForm(client || empty);
  }, [client, portfolios]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function submit(e) {
    e.preventDefault();
    onSubmit?.(form);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client?.id ? "Modifier le client" : "Ajouter un client"}
      footer={
        <div className="flex gap-3">
          <motion.button
            whileHover={{
              scale: 1.03,
              borderColor: "rgb(156, 163, 175)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            whileTap={{ scale: 0.97 }}
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
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portefeuille
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          <Input
            label="Adresse"
            value={form.adresse}
            onChange={(e) => update("adresse", e.target.value)}
          />
          <Input
            label="RC"
            value={form.rc || ""}
            onChange={(e) => update("rc", e.target.value)}
          />
          <Input
            label="IF"
            value={form.if || ""}
            onChange={(e) => update("if", e.target.value)}
          />
          <Input
            label="ICE"
            value={form.ice || ""}
            onChange={(e) => update("ice", e.target.value)}
          />
          <Input
            label="Forme juridique"
            value={form.forme_juridique}
            onChange={(e) => update("forme_juridique", e.target.value)}
          />
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
            label="Capital social"
            type="number"
            step="0.01"
            value={form.capital_social || ""}
            onChange={(e) => update("capital_social", e.target.value)}
          />
          <Input
            label="Associés (JSON)"
            placeholder='[{"nom":"...","parts":50}]'
            value={form.associes || ""}
            onChange={(e) => update("associes", e.target.value)}
          />
          <Input
            label="Régime fiscal"
            value={form.regime_fiscal}
            onChange={(e) => update("regime_fiscal", e.target.value)}
          />
          <Input
            label="Début de collaboration"
            type="date"
            value={form.date_debut_collaboration || ""}
            onChange={(e) => update("date_debut_collaboration", e.target.value)}
          />
          <Input
            label="Responsable client"
            value={form.responsable_client}
            onChange={(e) => update("responsable_client", e.target.value)}
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
      </form>
    </Modal>
  );
}

function ClientDocumentsModal({ client, onClose }) {
  const open = !!client;
  const qc = useQueryClient();
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["client-docs", client?.id],
    queryFn: async () => {
      if (!client?.id) return [];
      const { data } = await api.get(`/clients/${client.id}/documents`);
      return data;
    },
    enabled: !!client?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category, title, is_confidential }) => {
      const fd = new FormData();
      fd.append("file", file);
      if (category) fd.append("category", category);
      if (title) fd.append("title", title);
      if (is_confidential) fd.append("is_confidential", "1");
      const { data } = await api.post(`/clients/${client.id}/documents`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["client-docs", client?.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId) => {
      await api.delete(`/clients/${client.id}/documents/${docId}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["client-docs", client?.id] }),
  });
  const [confirmDoc, setConfirmDoc] = React.useState(null);

  const [file, setFile] = React.useState(null);
  const [category, setCategory] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [isConf, setIsConf] = React.useState(false);

  function resetForm() {
    setFile(null);
    setCategory("");
    setTitle("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? `Documents - ${client.raison_sociale}` : "Documents"}
      footer={
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="!from-gray-200 !to-gray-300 !text-gray-800"
          >
            Fermer
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <Input
              label="Catégorie"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={isConf}
                onChange={(e) => setIsConf(e.target.checked)}
              />{" "}
              Confidentiel
            </label>
            <Button
              disabled={!file || uploadMutation.isPending}
              onClick={() =>
                uploadMutation.mutate({
                  file,
                  category,
                  title,
                  is_confidential: isConf,
                })
              }
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
                <li
                  key={d.id}
                  className="py-2 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">{d.title}</p>
                    <p className="text-xs text-gray-500">
                      {d.category || "—"} · {(d.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm"
                      href={`${
                        import.meta.env.VITE_BACKEND_URL || ""
                      }/api/clients/${client.id}/documents/${d.id}/download`}
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
          description={
            confirmDoc ? `Supprimer le document "${confirmDoc.title}" ?` : ""
          }
          onCancel={() => setConfirmDoc(null)}
          onConfirm={() => {
            if (confirmDoc) {
              deleteMutation.mutate(confirmDoc.id);
              setConfirmDoc(null);
            }
          }}
        />
      </div>
    </Modal>
  );
}
