import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, User, Terminal, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs');
      const payload = res.data?.data || res.data || {};
      setLogs(payload.logs || []);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadgeColor = (action) => {
    if (action.startsWith('CREATE')) return 'bg-emerald-500/10 text-emerald-600';
    if (action.startsWith('UPDATE') || action.startsWith('ADJUST')) return 'bg-blue-500/10 text-blue-600';
    if (action.startsWith('DELETE') || action.startsWith('ARCHIVE') || action.startsWith('REJECT')) return 'bg-rose-500/10 text-rose-600';
    return 'bg-purple-500/10 text-purple-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sphere-border">
        <div>
          <h1 className="text-2xl font-black text-sphere-heading">System Audit Trail</h1>
          <p className="text-sm text-sphere-subtle mt-0.5">
            Immutable administrative operation logs, security tracking, and compliance records.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-sphere-card border border-sphere-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sphere-canvas/60 border-b border-sphere-border text-sphere-subtle uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Timestamp</th>
                <th className="py-3.5 px-4 font-bold">Operator</th>
                <th className="py-3.5 px-4 font-bold">Action</th>
                <th className="py-3.5 px-4 font-bold">Target Resource</th>
                <th className="py-3.5 px-4 font-bold">Parameters / Details</th>
                <th className="py-3.5 px-4 font-bold text-right">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sphere-border/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-sphere-subtle animate-pulse">
                    Retrieving audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-sphere-subtle">
                    No administrative audit events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-sphere-canvas/40 transition">
                    <td className="py-3 px-4 text-sphere-subtle whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-sphere-heading">{log.actor}</p>
                      <span className="text-[10px] uppercase font-bold text-sphere-primary">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-sphere-heading">
                      {log.entity} {log.entityId && <span className="font-mono text-[10px] text-sphere-subtle">({log.entityId.slice(-6)})</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-sphere-subtle max-w-sm truncate">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '—')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-sphere-subtle">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
