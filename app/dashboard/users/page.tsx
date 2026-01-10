import { users } from "@/lib/data";
import { Mail, GraduationCap } from "lucide-react";

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
                <p className="text-slate-500">View and manage registered students.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Full Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Faculty</th>
                                <th className="px-6 py-4">Grad Year</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{user.full_name}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-3 h-3 text-slate-400" />
                                            {user.faculty} {user.department ? `(${user.department})` : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.grad_year}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-xs">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
