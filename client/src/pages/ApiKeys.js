import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogIn,
  Shield,
} from 'lucide-react';

const ApiKeys = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', description: '' });
  const [newKeyPermissions, setNewKeyPermissions] = useState(['read', 'write']);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
    fetchApiKeys();
    }
  }, [isAuthenticated]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/apikeys');
      setApiKeys(response.data.apiKeys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view API keys');
      } else {
      toast.error('Failed to load API keys');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKey.name.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      setCreating(true);
      const response = await axios.post('/api/apikeys', {
        name: newKey.name,
        description: newKey.description,
        permissions: newKeyPermissions
      });

      const newKeyData = response.data;
      setApiKeys(prev => Array.isArray(prev) ? [newKeyData, ...prev] : [newKeyData]);
      setNewlyCreatedKey(newKeyData);
      setShowCreateModal(false);
      setNewKey({ name: '', description: '' });
      setNewKeyPermissions(['read', 'write']);
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to create API keys');
      } else {
        toast.error('Failed to create API key');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('API key copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy API key');
    }
  };

  const handleRevokeKey = async (keyId, keyName) => {
    if (!window.confirm(`Are you sure you want to revoke the API key "${keyName}"?`)) {
      return;
    }

    try {
      await axios.put(`/api/apikeys/${keyId}/revoke`);
      setApiKeys(prev => Array.isArray(prev) ? prev.map(key => 
        key.id === keyId ? { ...key, status: 'revoked' } : key
      ) : []);
      toast.success('API key revoked successfully');
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  const handleDeleteKey = async (keyId, keyName) => {
    if (!window.confirm(`Are you sure you want to delete the API key "${keyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/apikeys/${keyId}`);
      setApiKeys(prev => Array.isArray(prev) ? prev.filter(key => key.id !== keyId) : []);
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-8">
            Please log in to manage your API keys and access the AI Video Platform.
          </p>
          <Link
            to="/login"
            className="btn btn-primary px-8 py-4 inline-flex items-center"
          >
            <LogIn className="w-5 h-5 mr-3" />
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600">Manage your API keys for integrating with the AI Video Platform.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary px-8 py-4"
        >
          <Plus className="w-4 h-4 mr-3" />
          New API Key
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(apiKeys) ? apiKeys.length : 0}</p>
                <p className="text-sm text-gray-500">Total API Keys</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Array.isArray(apiKeys) ? apiKeys.filter(key => key.status === 'active').length : 0}
                </p>
                <p className="text-sm text-gray-500">Active Keys</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {Array.isArray(apiKeys) ? apiKeys.filter(key => key.status === 'revoked').length : 0}
                </p>
                <p className="text-sm text-gray-500">Revoked Keys</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="flex-1 overflow-hidden">
        <div className="card h-full flex flex-col">
          <div className="card-header flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="card-title">API Keys</h3>
                  <p className="card-description">Manage your API access credentials</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card-content flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading API keys...</p>
              </div>
            ) : !Array.isArray(apiKeys) || apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
                <p className="text-gray-500 mb-6">Create your first API key to start integrating with the AI Video Platform</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary px-8 py-4"
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Create First API Key
                </button>
            </div>
          ) : (
            <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{apiKey.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            apiKey.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {apiKey.status}
                        </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{apiKey.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                          {apiKey.last_used && (
                            <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {apiKey.status === 'active' && (
                          <>
                      <button
                              onClick={() => handleCopyKey(apiKey.key)}
                              className="btn btn-outline btn-sm px-3 py-2"
                      >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                      </button>
                      <button
                              onClick={() => handleRevokeKey(apiKey.id, apiKey.name)}
                              className="btn btn-outline btn-sm px-3 py-2 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                              <XCircle className="w-4 h-4 mr-2" />
                              Revoke
                      </button>
                          </>
                        )}
                      <button
                          onClick={() => handleDeleteKey(apiKey.id, apiKey.name)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New API Key</h3>
            </div>
            <form onSubmit={handleCreateKey} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full"
                  placeholder="My API Key"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newKey.description}
                  onChange={(e) => setNewKey(prev => ({ ...prev, description: e.target.value }))}
                  className="input w-full"
                  rows={3}
                  placeholder="Optional description of what this key is for"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline px-6 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary px-6 py-2"
                >
                  {creating ? 'Creating...' : 'Create Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New API Key Modal */}
      {newlyCreatedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">API Key Created</h3>
                  </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Make sure to copy your API key now. You won't be able to see it again!
                    </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newlyCreatedKey.key}
                    readOnly
                    className="input w-full pr-12 bg-gray-50"
                  />
                      <button
                    onClick={() => handleCopyKey(newlyCreatedKey.key)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                  onClick={() => setNewlyCreatedKey(null)}
                  className="btn btn-primary px-6 py-2"
                    >
                      Done
                    </button>
                  </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys; 