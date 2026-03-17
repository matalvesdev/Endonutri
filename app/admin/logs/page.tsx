"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) return <div>Loading logs...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Recent system interactions and events.</p>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.user_id || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-md">
                      {log.action === 'feedback' ? (
                        (() => {
                          try {
                            const parsed = JSON.parse(log.details);
                            return (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center text-yellow-500 text-lg">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i}>{i < (parsed.rating || 0) ? '★' : '☆'}</span>
                                  ))}
                                  <span className="ml-2 text-slate-600 text-xs font-medium">{parsed.rating}/5</span>
                                </div>
                                {parsed.comment && (
                                  <p className="text-xs text-slate-500 italic break-words">&quot;{parsed.comment}&quot;</p>
                                )}
                              </div>
                            );
                          } catch (e) {
                            return log.details;
                          }
                        })()
                      ) : (
                        <span className="truncate block">{log.details || '-'}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
