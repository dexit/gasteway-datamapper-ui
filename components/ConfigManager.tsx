import React, { useState, useEffect, useCallback } from 'react';
import { AnyConfig, ConfigType, DtoMapping, EtlConfig, DispatchRule, WebhookConfig } from '../types';
import { getConfigs, addConfig, updateConfig, deleteConfig } from '../services/api';
import { Spinner } from './common/Spinner';
import { Modal } from './common/Modal';
import { Badge } from './common/Badge';

interface ConfigManagerProps {
  type: ConfigType;
}

const getConfigFields = (type: ConfigType): (keyof AnyConfig)[] => {
  switch (type) {
    case ConfigType.DTO:
      return ['name', 'source_pattern', 'is_active'] as (keyof AnyConfig)[];
    case ConfigType.ETL:
      return ['name', 'source_dto', 'target_format', 'is_active'] as (keyof AnyConfig)[];
    case ConfigType.Dispatch:
      return ['name', 'pattern', 'target_url', 'method', 'is_active'] as (keyof AnyConfig)[];
    case ConfigType.Webhook:
      return ['provider', 'signature_header', 'is_active'] as (keyof AnyConfig)[];
    default:
      return [];
  }
};

const getEmptyConfig = (type: ConfigType): Omit<AnyConfig, 'id' | 'created_at' | 'updated_at'> => {
    switch (type) {
        case ConfigType.DTO: {
            const config: Omit<DtoMapping, 'id'|'created_at'|'updated_at'> = { name: '', is_active: true, source_pattern: '', target_schema: '{}', transformation_rules: '{}' };
            return config;
        }
        case ConfigType.ETL: {
            const config: Omit<EtlConfig, 'id'|'created_at'|'updated_at'> = { name: '', is_active: true, source_dto: '', target_format: '', extraction_rules: '{}', transformation_rules: '{}', load_rules: '{}' };
            return config;
        }
        case ConfigType.Dispatch: {
            const config: Omit<DispatchRule, 'id'|'created_at'|'updated_at'> = { name: '', is_active: true, pattern: '', target_url: '', method: 'POST', headers: '{}', retry_count: 3, timeout: 30000 };
            return config;
        }
        case ConfigType.Webhook: {
            const config: Omit<WebhookConfig, 'id'|'created_at'|'updated_at'> = { provider: 'hubspot', secret: '', signature_header: '', algorithm: 'SHA-256', is_active: true };
            return config;
        }
        default: throw new Error("Invalid config type");
    }
}

export const ConfigManager: React.FC<ConfigManagerProps> = ({ type }) => {
  const [configs, setConfigs] = useState<AnyConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AnyConfig | Omit<AnyConfig, 'id' | 'created_at' | 'updated_at'> | null>(null);

  const fields = getConfigFields(type);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConfigs(type);
      setConfigs(data.sort((a,b) => b.created_at - a.created_at));
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleOpenModal = (config: AnyConfig | null = null) => {
    setEditingConfig(config ? { ...config } : getEmptyConfig(type));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
  };
  
  const handleSave = async () => {
    if (!editingConfig) return;

    try {
        if ('id' in editingConfig) {
            await updateConfig(type, editingConfig as AnyConfig);
        } else {
            await addConfig(type, editingConfig as Omit<AnyConfig, 'id' | 'created_at' | 'updated_at'>);
        }
    } catch (error) {
        console.error(`Failed to save config:`, error);
    } finally {
        handleCloseModal();
        fetchConfigs();
    }
  };
  
  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this configuration?")) {
        try {
            await deleteConfig(type, id);
        } catch(error) {
            console.error('Failed to delete config:', error);
        } finally {
            fetchConfigs();
        }
    }
  }

  const renderFieldValue = (config: AnyConfig, field: keyof AnyConfig) => {
    const value = config[field as keyof typeof config];
    if (typeof value === 'boolean') {
      return <Badge color={value ? 'green' : 'gray'}>{value ? 'Active' : 'Inactive'}</Badge>;
    }
    if (typeof value === 'string' && value.length > 50) {
        return <span className="truncate block max-w-xs font-mono text-slate-400">{value}</span>;
    }
    if (typeof value === 'string') {
        return <span className="font-mono text-slate-400">{value}</span>
    }
    return String(value);
  };

  const renderModalForm = () => {
    if (!editingConfig) return null;

    const handleInputChange = (field: string, value: string | boolean | number) => {
      setEditingConfig(prev => prev ? { ...prev, [field]: value } : null);
    };
    
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
        {Object.keys(editingConfig).filter(key => !['id', 'created_at', 'updated_at'].includes(key)).map(key => {
          const value = editingConfig[key as keyof typeof editingConfig];
          const isJsonString = typeof value === 'string' && (key.endsWith('_rules') || key.endsWith('schema') || key === 'headers');
          
          if (typeof value === 'boolean') {
            return (
              <div key={key} className="flex items-center pt-2">
                <input id={key} type="checkbox" checked={value} onChange={(e) => handleInputChange(key, e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500" />
                <label htmlFor={key} className="ml-3 block text-sm font-medium text-slate-300 capitalize">{key.replace(/_/g, ' ')}</label>
              </div>
            );
          }

          if (isJsonString) {
            return (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-slate-300 capitalize">{key.replace(/_/g, ' ')}</label>
                <textarea
                  id={key}
                  rows={6}
                  value={value as string}
                  onChange={e => handleInputChange(key, e.target.value)}
                  className="mt-1 block w-full rounded-md bg-slate-950 border-slate-700 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm text-slate-200 font-mono"
                  spellCheck="false"
                />
              </div>
            );
          }

          if (key === 'provider') {
            return (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-slate-300 capitalize">{key.replace(/_/g, ' ')}</label>
                <select
                  id={key}
                  value={value as string}
                  onChange={e => handleInputChange(key, e.target.value)}
                  className="mt-1 block w-full rounded-md bg-slate-800 border-slate-700 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm text-slate-200"
                >
                  <option>hubspot</option>
                  <option>twilio</option>
                </select>
              </div>
            )
          }

          return (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-slate-300 capitalize">{key.replace(/_/g, ' ')}</label>
              <input
                type={typeof value === 'number' ? 'number' : 'text'}
                id={key}
                value={String(value)}
                onChange={e => handleInputChange(key, typeof value === 'number' ? (parseInt(e.target.value, 10) || 0) : e.target.value)}
                className="mt-1 block w-full rounded-md bg-slate-800 border-slate-700 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm text-slate-200"
                required
              />
            </div>
          );
        })}
        <div className="flex justify-end pt-5 space-x-3">
          <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500">Save</button>
        </div>
      </form>
    );
  };


  if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">{type}</h1>
        <button onClick={() => handleOpenModal(null)} className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600">
          Add New
        </button>
      </div>
       <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                {fields.map(field => (
                  <th key={String(field)} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider capitalize">{String(field).replace(/_/g, ' ')}</th>
                ))}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {configs.map((config) => (
                <tr key={config.id} className="hover:bg-slate-800/50 transition-colors">
                  {fields.map(field => (
                     <td key={`${config.id}-${String(field)}`} className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{renderFieldValue(config, field)}</td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(config)} className="text-cyan-400 hover:text-cyan-300">Edit</button>
                    <button onClick={() => handleDelete(config.id)} className="text-red-500 hover:text-red-400">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingConfig && 'id' in editingConfig ? `Edit ${type}` : `New ${type}`}>
        {renderModalForm()}
      </Modal>
    </>
  );
};