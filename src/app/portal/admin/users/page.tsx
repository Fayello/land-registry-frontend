"use client";
import { API_URL } from "@/config/api";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Shield,
    Check,
    X,
    Loader2,
    MoreHorizontal,
    UserCog
} from "lucide-react";

interface Role {
    id: number;
    name: string;
    description: string;
}

interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    role_obj: Role | null;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Edit Role State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        try {
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/users`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/api/admin/roles`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            if (usersRes.ok && rolesRes.ok) {
                setUsers(await usersRes.json());
                setRoles(await rolesRes.json());
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignRole = async () => {
        if (!editingUser || !selectedRoleId) return;

        setSaving(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/admin/assign-role`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userId: editingUser.id, roleId: selectedRoleId })
            });

            if (response.ok) {
                setEditingUser(null);
                setSelectedRoleId(null);
                await fetchData();
            }
        } catch (error) {
            console.error("Error assigning role:", error);
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Loading User Directory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 text-indigo-600 mb-2">
                        <Users size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Directory Access</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">User Management</h1>
                    <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">View system users and assign authority roles. Effective changes are logged in the immutable audit trail.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-3xl py-4 pl-16 pr-6 text-slate-900 shadow-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Role</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, idx) => (
                                <tr key={user.id} className={`group hover:bg-slate-50/50 transition-colors ${idx !== filteredUsers.length - 1 ? "border-b border-slate-100" : ""}`}>
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                                                {user.full_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-900 tracking-tight">{user.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-sm text-slate-500 font-medium">{user.email}</td>
                                    <td className="p-8">
                                        {user.role_obj ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                                                <Shield size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{user.role_obj.name}</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-200">
                                                <span className="text-[10px] font-black uppercase tracking-wider">{user.role.toUpperCase()} (Legacy)</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-8 text-xs text-slate-400 font-mono">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-8 text-right">
                                        <button
                                            onClick={() => {
                                                setEditingUser(user);
                                                setSelectedRoleId(user.role_obj?.id || null);
                                            }}
                                            className="p-2 text-slate-400 hover:text-white bg-slate-50 hover:bg-indigo-600 rounded-xl transition-all border border-slate-100"
                                        >
                                            <UserCog size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Role Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Assign Role</h2>
                                <p className="text-slate-500 text-sm mt-1">For <span className="text-indigo-600 font-bold">{editingUser.full_name}</span></p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {roles.map(role => {
                                const isSelected = selectedRoleId === role.id;
                                return (
                                    <div
                                        key={role.id}
                                        onClick={() => setSelectedRoleId(role.id)}
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                                            ? "bg-indigo-50 border-indigo-200"
                                            : "bg-slate-50 border-slate-100 hover:border-slate-300"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className={`text-sm font-black uppercase tracking-wide ${isSelected ? "text-indigo-600" : "text-slate-900"}`}>
                                                    {role.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="bg-indigo-600 rounded-full p-1 text-white shadow-sm">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 px-8 py-4 bg-slate-50 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignRole}
                                disabled={saving}
                                className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-500 shadow-indigo-600/20 transition-all disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Update Role"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
