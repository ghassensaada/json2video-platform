import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Video,
  Calendar,
  Search,
  MoreVertical,
  LogIn,
} from 'lucide-react';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/templates');
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view templates');
        navigate('/login');
      } else {
      toast.error('Failed to load templates');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchTemplates();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, fetchTemplates]);

  const handleDelete = async (templateId, templateName) => {
    if (!window.confirm(`Are you sure you want to delete "${templateName}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/templates/${templateId}`);
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to delete templates');
        navigate('/login');
      } else {
      toast.error('Failed to delete template');
      }
    }
  };

  const handleDuplicate = async (templateId) => {
    try {
      await axios.post(`/api/templates/${templateId}/duplicate`);
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to duplicate templates');
        navigate('/login');
      } else {
      toast.error('Failed to duplicate template');
      }
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-8 animate-fade-in-up pb-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                Templates
              </h1>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl">
              Please log in to access your video templates.
            </p>
          </div>
          <Link
            to="/login"
            className="btn btn-primary btn-lg group hover-lift px-8 py-4"
          >
            <LogIn className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
            Sign In
          </Link>
        </div>

        {/* Login Prompt Card */}
        <div className="card hover-lift animate-fade-in-up">
          <div className="card-content p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Video className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to Access Templates</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create, edit, and manage your video templates. Build amazing videos with our AI-powered platform.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="btn btn-primary btn-lg group hover-lift px-10 py-4"
              >
                <LogIn className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Sign In to Templates
              </Link>
              <div className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Create one here
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Editor</h3>
            <p className="text-gray-600 text-sm">Drag and drop interface for creating video templates</p>
          </div>
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Copy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Library</h3>
            <p className="text-gray-600 text-sm">Save and reuse templates for consistent branding</p>
          </div>
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Creation</h3>
            <p className="text-gray-600 text-sm">Quickly create new templates from scratch</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">Manage your video templates and create new ones.</p>
        </div>
        <Link
          to="/templates/new"
          className="btn btn-primary px-8 py-4"
        >
          <Plus className="w-4 h-4 mr-3" />
          New Template
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="all">All Templates</option>
            <option value="recent">Recently Updated</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto">
      {filteredTemplates.length === 0 ? (
          <div className="card h-full flex items-center justify-center">
          <div className="card-content">
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No templates found' : 'No templates yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating your first video template'
                }
              </p>
              {!searchTerm && (
                <Link
                  to="/templates/new"
                    className="btn btn-primary px-8 py-4"
                >
                    <Plus className="w-4 h-4 mr-3" />
                  Create First Template
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="card group hover:shadow-md transition-shadow">
              <div className="card-content">
                {/* Template Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Template Preview */}
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {template.thumbnail_url ? (
                    <img
                      src={template.thumbnail_url}
                      alt={template.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No preview</p>
                    </div>
                  )}
                </div>

                {/* Template Meta */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Updated {formatDate(template.updated_at)}</span>
                </div>

                {/* Template Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      to={`/templates/${template.id}`}
                        className="btn btn-outline btn-sm px-4 py-2"
                    >
                        <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDuplicate(template.id)}
                        className="btn btn-outline btn-sm px-4 py-2"
                      title="Duplicate template"
                    >
                        <Copy className="w-3 h-3 mr-2" />
                      Duplicate
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(template.id, template.name)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete template"
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

      {/* Template Stats */}
      <div className="card flex-shrink-0">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              <p className="text-sm text-gray-500">Total Templates</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {templates.filter(t => {
                  const daysSinceUpdate = (new Date() - new Date(t.updated_at)) / (1000 * 60 * 60 * 24);
                  return daysSinceUpdate <= 7;
                }).length}
              </p>
              <p className="text-sm text-gray-500">Updated This Week</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {templates.filter(t => t.description).length}
              </p>
              <p className="text-sm text-gray-500">With Descriptions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates; 