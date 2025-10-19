import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from "framer-motion";
import api from "../lib/api";
import RequirePermission from "../components/RequirePermission";
import Button from "../components/ui/Button";

export default function SettingsRoles() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["roles-permissions"],
    queryFn: async () => {
      try {
        const response = await api.get("/roles-permissions");
        return response.data;
      } catch (error) {
        console.error("Error fetching roles & permissions:", error);
        throw error;
      }
    },
  });

  const mutate = useMutation({
    mutationFn: async ({ roleId, permissions }) => {
      try {
        const response = await api.put(`/roles/${roleId}/permissions`, {
          permissions,
        });
        return response.data;
      } catch (error) {
        console.error("Error updating permissions:", error);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles-permissions"] });
    },
    onError: (error) => {
      const message =
        error.response?.status === 403
          ? "Vous n'avez pas la permission de modifier les rôles"
          : error.response?.data?.message ||
            error.message ||
            "Impossible de mettre à jour les permissions";
      alert(`Erreur: ${message}`);
    },
  });

  const roles = data?.roles ?? [];
  const permissions = data?.permissions ?? [];
  const matrix = data?.matrix ?? {};

  function toggle(role, perm) {
    const current = new Set(matrix[role.name] || []);
    if (current.has(perm.name)) current.delete(perm.name);
    else current.add(perm.name);
    mutate.mutate({ roleId: role.id, permissions: Array.from(current) });
  }

  return (
    <RequirePermission
      perm="users.edit"
      fallback={
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl text-center"
        >
          <svg
            className="w-16 h-16 mx-auto mb-4 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <p className="text-xl font-semibold mb-2">Accès refusé</p>
          <p className="text-sm">
            Vous n'avez pas la permission d'accéder à cette page
          </p>
        </motion.div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Rôles et permissions
          </h1>
          <p className="text-gray-600">
            Gérez les permissions pour chaque rôle utilisateur
          </p>
        </motion.div>

        {/* Error Display */}
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
                "Impossible de charger les rôles et permissions"}
            </p>
          </motion.div>
        )}

        {/* Loading State */}
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
          <>
            {/* Table */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10">
                        Permission
                      </th>
                      {roles.map((r, i) => (
                        <th
                          key={r.id}
                          className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold shadow-lg">
                              {r.name?.[0]?.toUpperCase() || "R"}
                            </div>
                            <span>{r.name}</span>
                          </motion.div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {permissions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={roles.length + 1}
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
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            <p className="font-medium">Aucune permission</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      permissions.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              {p.name}
                            </div>
                          </td>
                          {roles.map((r) => {
                            const checked = (matrix[r.name] || []).includes(
                              p.name
                            );
                            return (
                              <td key={r.id} className="px-6 py-4 text-center">
                                <label className="inline-flex flex-col items-center gap-1 cursor-pointer group">
                                  <motion.input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggle(r, p)}
                                    disabled={mutate.isPending}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-5 h-5 text-primary-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  />
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                                      checked
                                        ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                                    }`}
                                  >
                                    {checked ? "Activé" : "Désactivé"}
                                  </span>
                                </label>
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="text-sm text-gray-500">
                {permissions.length} permission(s) · {roles.length} rôle(s)
              </div>
              <Button
                onClick={() =>
                  qc.invalidateQueries({ queryKey: ["roles-permissions"] })
                }
                className="!from-gray-600 !to-gray-700"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Rafraîchir
              </Button>
            </motion.div>

            {/* Loading Indicator */}
            {mutate.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2"
              >
                <svg
                  className="animate-spin h-5 w-5"
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
                <span>Mise à jour...</span>
              </motion.div>
            )}
          </>
        )}
      </div>
    </RequirePermission>
  );
}
