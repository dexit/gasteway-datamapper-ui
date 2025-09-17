import React, { useState, useEffect, useCallback } from 'react';
import { getIngestRequests } from '../services/api';
import { RawRequest } from '../types';
import { Spinner } from './common/Spinner';
import { Modal } from './common/Modal';
import { Badge } from './common/Badge';
import { useToast } from '../contexts/ToastContext';
import { useTableManager } from '../hooks/useTableManager';
import { TableControls } from './common/TableControls';
import { ChevronUpIcon, ChevronDownIcon } from './icons';

export const IngestRequests: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RawRequest | null>(null);
  const { addToast } = useToast();

  const {
    paginatedItems,
    requestSort,
    sortConfig,
    handleFilterChange,
    filter,
    currentPage,
    setCurrentPage,
    totalPages,
    setItems,
    totalItems,
    itemsPerPage,
  } = useTableManager<RawRequest>({
      itemsPerPage: 10,
      initialSortKey: 'timestamp',
      searchableKeys: ['method', 'url', 'ip'],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getIngestRequests();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch raw requests:", error);
      addToast(`Failed to fetch ingest requests: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, setItems]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getMethodBadgeColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'blue';
      case 'POST': return 'green';
      case 'PUT': return 'yellow';
      case 'DELETE': return 'red';
      default: return 'gray';
    }
  };

  const renderSortIcon = (key: keyof RawRequest) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <span className="w-4 h-4 text-slate-500 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronDownIcon/></span>;
    }
    if (sortConfig.direction === 'ascending') {
        return <span className="w-4 h-4 text-slate-300 inline-block ml-2"><ChevronUpIcon/></span>;
    }
    return <span className="w-4 h-4 text-slate-300 inline-block ml-2"><ChevronDownIcon/></span>;
  };

  const tableHeaders: { key: keyof RawRequest; label: string }[] = [
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'method', label: 'Method' },
      { key: 'url', label: 'URL' },
      { key: 'ip', label: 'IP Address' },
  ];

  if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Ingest Requests</h1>
       <TableControls
          filter={filter}
          onFilterChange={handleFilterChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
      />
      <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                {tableHeaders.map(header => (
                    <th key={header.key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                         <button onClick={() => requestSort(header.key)} className="group flex items-center">
                            {header.label}
                            {renderSortIcon(header.key)}
                        </button>
                    </th>
                ))}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedItems.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(req.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><Badge color={getMethodBadgeColor(req.method)}>{req.method}</Badge></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 truncate max-w-md">{req.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">{req.ip}</td>
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