import React, { useState, useEffect } from 'react';
import { getIngestRequests } from '../services/api';
import { RawRequest } from '../types';
import { Spinner } from './common/Spinner';
import { Modal } from './common/Modal';
import { Badge } from './common/Badge';

export const IngestRequests: React.FC = () => {
  const [requests, setRequests] = useState<RawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RawRequest | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getIngestRequests();
        setRequests(data.sort((a,b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error("Failed to fetch raw requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMethodBadgeColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'blue';
      case 'POST': return 'green';
      case 'PUT': return 'yellow';
      case 'DELETE': return 'red';
      default: return 'gray';
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-6">Ingest Requests</h1>
      <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Method</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">URL</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">IP Address</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(req.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><Badge color={getMethodBadgeColor(req.method)}>{req.method}</Badge></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 truncate max-w-md">{req.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{req.ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setSelectedRequest(req)} className="text-cyan-400 hover:text-cyan-300">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Ingest Request Details">
        {selectedRequest && (
          <div className="text-slate-300 space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Request Info</h3>
              <p><strong>ID:</strong> <span className="font-mono text-xs">{selectedRequest.id}</span></p>
              <p><strong>Timestamp:</strong> {new Date(selectedRequest.timestamp).toISOString()}</p>
              <p><strong>URL:</strong> {selectedRequest.url}</p>
              <p><strong>Method:</strong> {selectedRequest.method}</p>
              <p><strong>IP:</strong> {selectedRequest.ip}</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Headers</h3>
              <pre className="bg-slate-950 p-3 rounded-md text-sm overflow-x-auto"><code>{JSON.stringify(selectedRequest.headers, null, 2)}</code></pre>
            </div>
             <div>
              <h3 className="font-semibold text-white mb-2">Query Params</h3>
              <pre className="bg-slate-950 p-3 rounded-md text-sm overflow-x-auto"><code>{selectedRequest.query_params || 'None'}</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Body</h3>
              <pre className="bg-slate-950 p-3 rounded-md text-sm overflow-x-auto"><code>{selectedRequest.body ? JSON.stringify(JSON.parse(selectedRequest.body), null, 2) : 'Empty Body'}</code></pre>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};