import React, { useState, useEffect } from 'react';
import { getDispatchLogs } from '../services/api';
import { DispatchLog } from '../types';
import { Spinner } from './common/Spinner';
import { Modal } from './common/Modal';
import { Badge } from './common/Badge';

export const DispatchLogs: React.FC = () => {
  const [logs, setLogs] = useState<DispatchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<DispatchLog | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getDispatchLogs();
        setLogs(data.sort((a,b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error("Failed to fetch dispatch logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadgeColor = (status: DispatchLog['status']) => {
    switch (status) {
      case 'SUCCESS': return 'green';
      case 'FAILED': return 'red';
      default: return 'gray';
    }
  };
  
  const renderJson = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch(e) {
      return jsonString; // Return as is if not valid JSON
    }
  }

  if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-6">Dispatch Logs</h1>
       <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Rule</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Target URL</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Exec. Time</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><Badge color={getStatusBadgeColor(log.status)}>{log.status_code} {log.status}</Badge></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{log.rule_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 truncate max-w-md">{log.target_url}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{log.execution_time}ms</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setSelectedLog(log)} className="text-cyan-400 hover:text-cyan-300">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Dispatch Log Details">
        {selectedLog && (
            <div className="text-slate-300 space-y-4">
                <div>
                    <h3 className="font-semibold text-white mb-2">Dispatch Info</h3>
                    <p><strong>ID:</strong> <span className="font-mono text-xs">{selectedLog.id}</span></p>
                    <p><strong>Ingest Request ID:</strong> <span className="font-mono text-xs">{selectedLog.ingest_request_id}</span></p>
                    <p><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toISOString()}</p>
                    <p><strong>Status:</strong> {selectedLog.status} ({selectedLog.status_code})</p>
                    <p><strong>Rule:</strong> {selectedLog.rule_name} (<span className="font-mono text-xs">{selectedLog.rule_id}</span>)</p>
                    <p><strong>Target URL:</strong> {selectedLog.target_url}</p>
                    <p><strong>Retries:</strong> {selectedLog.retry_attempts}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-white mb-2">Response Body</h3>
                    <pre className="bg-slate-950 p-3 rounded-md text-sm overflow-x-auto"><code>{renderJson(selectedLog.response_body)}</code></pre>
                </div>
            </div>
        )}
      </Modal>
    </>
  );
};