"use client";

import { useState, useEffect } from "react";
import { User, Shield, GraduationCap, Search, Plus, Trash2, ArrowUpDown, UserCheck, UserX, Activity, Crown, ShieldAlert } from "lucide-react";
import { useToast } from "@/lib/ToastContext";
import { useRole } from "@/lib/RoleContext";
import { getUsers, toggleUserStatus, deleteUser as deleteUserAction, promoteUserRole, demoteUserRole, type UserData } from "@/lib/actions/user-management";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "STUDENT";

// Helper function to convert database isActive to UI status
function getUserStatus(isActive: boolean): "Active" | "Inactive" {
    return isActive ? "Active" : "Inactive";
}

// Role hierarchy helpers
const ROLE_HIERARCHY: Record<UserRole, number> = {
    'SUPER_ADMIN': 3,
    'ADMIN': 2,
    'STUDENT': 1
};

function canManageUser(currentUserRole: UserRole | null, targetUserRole: UserRole): boolean {
    if (!currentUserRole) return false;
    // Super Admin can manage everyone except other Super Admins
    if (currentUserRole === 'SUPER_ADMIN') {
        return targetUserRole !== 'SUPER_ADMIN';
    }
    // Admin can only manage Students
    if (currentUserRole === 'ADMIN') {
        return targetUserRole === 'STUDENT';
    }
    return false;
}

function getRoleIcon(role: UserRole) {
    switch (role) {
        case 'SUPER_ADMIN':
            return <Crown className="w-5 h-5" />;
        case 'ADMIN':
            return <Shield className="w-5 h-5" />;
        default:
            return <GraduationCap className="w-5 h-5" />;
    }
}

function getRoleStyles(role: UserRole): string {
    switch (role) {
        case 'SUPER_ADMIN':
            return 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
        case 'ADMIN':
            return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600';
        default:
            return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600';
    }
}

function getRoleIconStyles(role: UserRole): string {
    switch (role) {
        case 'SUPER_ADMIN':
            return 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-600';
        case 'ADMIN':
            return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600';
        default:
            return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600';
    }
}

export default function UsersPage() {
    const { showToast } = useToast();
    const { isSuperAdmin, userRole } = useRole();
    const [users, setUsers] = useState<UserData[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"ALL" | "SUPER_ADMIN" | "ADMIN" | "STUDENT">("ALL");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Inactive">("ALL");
    const [sortBy, setSortBy] = useState<"name" | "email" | "role" | "joinedAt">("name");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", faculty: "", role: "STUDENT" as UserRole });

    // Load users from database
    useEffect(() => {
        const loadData = async () => {
            const dbUsers = await getUsers();
            setUsers(dbUsers);
        };
        loadData();
    }, []);

    // Filter and sort users
    const filteredUsers = users
        .filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                (u.faculty || '').toLowerCase().includes(search.toLowerCase());
            const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
            const userStatus = getUserStatus(u.isActive);
            const matchesStatus = statusFilter === "ALL" || userStatus === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortBy === "name") cmp = a.name.localeCompare(b.name);
            else if (sortBy === "email") cmp = a.email.localeCompare(b.email);
            else if (sortBy === "role") cmp = ROLE_HIERARCHY[b.role] - ROLE_HIERARCHY[a.role];
            else if (sortBy === "joinedAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return sortDir === "asc" ? cmp : -cmp;
        });

    const handleSort = (field: typeof sortBy) => {
        if (sortBy === field) {
            setSortDir(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortDir("asc");
        }
    };

    // Note: User creation is handled through the database seeding or a separate admin panel
    // This demo add user modal is kept for UI consistency but should be connected to a proper API
    const handleAddUser = () => {
        showToast("User creation should be done through database seeding or proper user registration", "info");
        setShowAddModal(false);
    };

    const handlePromoteRole = async (userId: string) => {
        const result = await promoteUserRole(userId);
        if (result.success) {
            showToast(`User promoted to ${result.newRole}`, "success");
            // Reload users
            const dbUsers = await getUsers();
            setUsers(dbUsers);
        } else {
            showToast(result.error || "Failed to promote user", "error");
        }
    };

    const handleDemoteRole = async (userId: string) => {
        const result = await demoteUserRole(userId);
        if (result.success) {
            showToast(`User demoted to ${result.newRole}`, "success");
            // Reload users
            const dbUsers = await getUsers();
            setUsers(dbUsers);
        } else {
            showToast(result.error || "Failed to demote user", "error");
        }
    };

    const handleToggleStatus = async (userId: string) => {
        const result = await toggleUserStatus(userId);
        if (result.success && result.user) {
            const newStatus = getUserStatus(result.user.isActive);
            showToast(`${result.user.name} is now ${newStatus}`, "success");
            // Reload users
            const dbUsers = await getUsers();
            setUsers(dbUsers);
        } else {
            showToast(result.error || "Failed to toggle user status", "error");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;

        const result = await deleteUserAction(userId);
        if (result.success) {
            showToast(`User "${user.name}" deleted.`, "success");
            // Reload users
            const dbUsers = await getUsers();
            setUsers(dbUsers);
        } else {
            showToast(result.error || "Failed to delete user", "error");
        }
    };

    const stats = {
        total: users.length,
        superAdmins: users.filter(u => u.role === "SUPER_ADMIN").length,
        admins: users.filter(u => u.role === "ADMIN").length,
        students: users.filter(u => u.role === "STUDENT").length,
        active: users.filter(u => u.isActive).length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            User Management
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage users, roles, and permissions.
                        {isSuperAdmin && (
                            <span className="ml-2 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <Crown className="w-4 h-4" />
                                Super Admin Access
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs text-slate-500">Total Users</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg">
                            <Crown className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.superAdmins}</p>
                            <p className="text-xs text-slate-500">Super Admins</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.admins}</p>
                            <p className="text-xs text-slate-500">Admins</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.students}</p>
                            <p className="text-xs text-slate-500">Students</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
                            <p className="text-xs text-slate-500">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                >
                    <option value="ALL">All Roles</option>
                    <option value="SUPER_ADMIN">👑 Super Admins</option>
                    <option value="ADMIN">🛡️ Admins</option>
                    <option value="STUDENT">🎓 Students</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                >
                    <option value="ALL">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <button onClick={() => handleSort("name")} className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600">
                                        User
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button onClick={() => handleSort("role")} className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600">
                                        Role
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300 hidden md:table-cell">Faculty</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300 hidden lg:table-cell">Activity</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.map(user => {
                                const canManage = canManageUser(userRole, user.role);
                                const canPromote = canManage && user.role !== 'SUPER_ADMIN' && (user.role === 'STUDENT' || (user.role === 'ADMIN' && isSuperAdmin));
                                const canDemote = canManage && user.role === 'ADMIN';

                                return (
                                    <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${user.role === 'SUPER_ADMIN' ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleIconStyles(user.role)}`}>
                                                    {getRoleIcon(user.role)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                        {user.role === 'SUPER_ADMIN' && (
                                                            <span className="text-amber-500" title="Super Admin - Protected">
                                                                <ShieldAlert className="w-4 h-4" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getRoleStyles(user.role)}`}>
                                                {user.role === 'SUPER_ADMIN' && <Crown className="w-3 h-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 hidden md:table-cell">{user.faculty}</td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <div className="text-xs">
                                                <p className="text-slate-900 dark:text-white font-medium">{user.submissionCount || 0} submissions</p>
                                                <p className="text-slate-500">{user.points || 0} points</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${user.isActive
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                }`}>
                                                {getUserStatus(user.isActive)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-1">
                                                {/* Promote Button */}
                                                <button
                                                    onClick={() => handlePromoteRole(user.id)}
                                                    disabled={!canPromote}
                                                    className={`p-2 rounded-lg transition-colors ${canPromote
                                                        ? 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        : 'text-slate-200 dark:text-slate-700 cursor-not-allowed'
                                                        }`}
                                                    title={canPromote ? `Promote to ${user.role === 'STUDENT' ? 'Admin' : 'Super Admin'}` : 'Cannot promote'}
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                                {/* Demote Button */}
                                                <button
                                                    onClick={() => handleDemoteRole(user.id)}
                                                    disabled={!canDemote}
                                                    className={`p-2 rounded-lg transition-colors ${canDemote
                                                        ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                        : 'text-slate-200 dark:text-slate-700 cursor-not-allowed'
                                                        }`}
                                                    title={canDemote ? 'Demote to Student' : 'Cannot demote'}
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                                {/* Status Toggle */}
                                                <button
                                                    onClick={() => handleToggleStatus(user.id)}
                                                    disabled={user.role === 'SUPER_ADMIN'}
                                                    className={`p-2 rounded-lg transition-colors ${user.role !== 'SUPER_ADMIN'
                                                        ? user.isActive
                                                            ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                            : "text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        : 'text-slate-200 dark:text-slate-700 cursor-not-allowed'
                                                        }`}
                                                    title={user.role === 'SUPER_ADMIN' ? 'Cannot modify Super Admin' : user.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    <Activity className="w-4 h-4" />
                                                </button>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={user.role === 'SUPER_ADMIN' || !canManage}
                                                    className={`p-2 rounded-lg transition-colors ${user.role !== 'SUPER_ADMIN' && canManage
                                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        : 'text-slate-200 dark:text-slate-700 cursor-not-allowed'
                                                        }`}
                                                    title={user.role === 'SUPER_ADMIN' ? 'Cannot delete Super Admin' : 'Delete User'}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No users found matching your criteria.
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New User</h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Faculty</label>
                                <input
                                    type="text"
                                    value={newUser.faculty}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, faculty: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                    placeholder="Computer Science"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                >
                                    <option value="STUDENT">🎓 Student</option>
                                    {isSuperAdmin && (
                                        <>
                                            <option value="ADMIN">🛡️ Admin</option>
                                            <option value="SUPER_ADMIN">👑 Super Admin</option>
                                        </>
                                    )}
                                </select>
                                {!isSuperAdmin && (
                                    <p className="text-xs text-slate-500 mt-1">Only Super Admins can create Admin accounts</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => { setShowAddModal(false); setNewUser({ name: "", email: "", faculty: "", role: "STUDENT" }); }}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700"
                            >
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
