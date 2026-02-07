"use client";
import { API_URL } from "@/config/api";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Plus,
    Save,
    Check,
    X,
    AlertCircle,
    ShieldAlert,
    Info,
    Loader2
} from "lucide-react";

interface Permission {
    id: number;
    name: string;
    description: string;
}

interface Role {
    id: number;
    name: string;
    description: string;
    permissions: Permission[];
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showNewRole, setShowNewRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        try {
            const [rolesRes, permsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/roles`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/api/admin/permissions`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            if (rolesRes.ok && permsRes.ok) {
                setRoles(await rolesRes.json());
                setPermissions(await permsRes.json());
            }
        } catch (error) {
            console.error("Error fetching RBAC data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTogglePermission = async (roleId: number, permissionId: number) => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return;

        const isAssigned = role.permissions.some(p => p.id === permissionId);
        let newPermissionIds: number[];

        if (isAssigned) {
            newPermissionIds = role.permissions.filter(p => p.id !== permissionId).map(p => p.id);
        } else {
            newPermissionIds = [...role.permissions.map(p => p.id), permissionId];
        }

        setSaving(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/admin/roles/${roleId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ permissionIds: newPermissionIds })
            });

            if (response.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error("Error updating role:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName) return;
        setSaving(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/admin/roles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: newRoleName, description: newRoleDesc })
            });

            if (response.ok) {
                setShowNewRole(false);
                setNewRoleName("");
                setNewRoleDesc("");
                await fetchData();
            }
        } catch (error) {
            console.error("Error creating role:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Synchronizing Authority Matrix...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 text-indigo-600 mb-2">
                        <ShieldCheck size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Governance</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Roles & Permissions</h1>
                    <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">Define custom authority roles and map granular system permissions to ensure a secure, audited land procedure.</p>
                </div>
                <button
                    onClick={() => setShowNewRole(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                    <Plus size={18} />
                    Create Custom Role
                </button>
            </div>

            {/* Permission Matrix */}
            <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-8 w-80">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Info size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Authority Perms</span>
                                    </div>
                                </th>
                                {roles.map(role => (
                                    <th key={role.id} className="p-8 text-center min-w-[200px]">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{role.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1 max-w-[150px] mx-auto truncate" title={role.description}>{role.description || "Official Authority"}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((perm, idx) => (
                                <tr key={perm.id} className={`group hover:bg-slate-50/50 transition-colors ${idx !== permissions.length - 1 ? "border-b border-slate-100" : ""}`}>
                                    <td className="p-8">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 tracking-wide">{perm.name}</span>
                                            <span className="text-[10px] text-slate-500 font-bold mt-1">{perm.description}</span>
                                        </div>
                                    </td>
                                    {roles.map(role => {
                                        const isAssigned = role.permissions.some(p => p.id === perm.id);
                                        return (
                                            <td key={`${role.id}-${perm.id}`} className="p-8 text-center">
                                                <button
                                                    onClick={() => handleTogglePermission(role.id, perm.id)}
                                                    disabled={saving || (role.name === "Super Admin" && perm.name === "admin.manage_rbac")}
                                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto transition-all ${isAssigned
                                                        ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm"
                                                        : "bg-slate-50 text-slate-300 border border-slate-100 hover:border-indigo-200"
                                                        } ${saving ? "opacity-30 cursor-wait" : "active:scale-90"}`}
                                                >
                                                    {isAssigned ? <Check size={20} strokeWidth={3} /> : <X size={16} />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Role Modal */}
            {showNewRole && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4 text-indigo-600">
                                <Plus size={24} />
                                <h2 className="text-2xl font-black text-slate-900">Create New Role</h2>
                            </div>
                            <button onClick={() => setShowNewRole(false)} className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Role Identity</label>
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="e.g. Regional Inspector"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Authority Scope</label>
                                <textarea
                                    value={newRoleDesc}
                                    onChange={(e) => setNewRoleDesc(e.target.value)}
                                    placeholder="Describe the legal reach of this role..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors h-32 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setShowNewRole(false)}
                                className="flex-1 px-8 py-4 bg-slate-50 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRole}
                                disabled={saving || !newRoleName}
                                className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-500 shadow-indigo-600/20 transition-all disabled:opacity-50"
                            >
                                {saving ? "Synchronizing..." : "Initialize Role"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Footer */}
            <div className="bg-orange-50 border border-orange-100 p-8 rounded-[32px] flex gap-6 items-start">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 shrink-0">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h4 className="text-orange-600 font-black uppercase text-xs tracking-widest mb-2">High Privilege Directive</h4>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-4xl">Modifying roles directly impacts the legal validity of system operations. Changes are tracked in the high-integrity Audit Log. Ensure all modifications align with the current Land Law framework.</p>
                </div>
            </div>
        </div>
    );
}
