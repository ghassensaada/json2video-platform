import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  Trash2,
  RefreshCw,
  Download,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  X,
  LogIn,
  BarChart3,
  Plus,
  Play,
  Eye,
} from 'lucide-react';

const RenderLogs = () => {
  const [renders, setRenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRender, setSelectedRender] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchRenders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/renders');
      setRenders(response.data.renders || []);
    } catch (error) {
      console.error('Error fetching renders:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view render logs');
        navigate('/login');
      } else {
      toast.error('Failed to load render logs');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchRenders();
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchRenders, 10000);
        return () => clearInterval(interval);
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, fetchRenders]);

  const handleDelete = async (renderId, projectId) => {
    if (!window.confirm(`Are you sure you want to delete render ${projectId}?`)) {
      return;
    }

    try {
      await axios.delete(`/api/renders/${renderId}`);
      toast.success('Render deleted successfully');
      fetchRenders();
    } catch (error) {
      console.error('Error deleting render:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to delete renders');
        navigate('/login');
      } else {
      toast.error('Failed to delete render');
      }
    }
  };

  const handleRetry = async (renderId) => {
    try {
      await axios.post(`/api/renders/${renderId}/retry`);
      toast.success('Render retry initiated');
      fetchRenders();
    } catch (error) {
      console.error('Error retrying render:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to retry renders');
        navigate('/login');
      } else {
      toast.error('Failed to retry render');
      }
    }
  };

  const showErrorDetails = (render) => {
    setSelectedRender(render);
    setShowErrorModal(true);
  };

  const handleViewVideo = async (render) => {
    try {
      setVideoUrl(`/api/renders/${render.id}/view`);
      setShowVideoModal(true);
    } catch (error) {
      console.error('Error viewing video:', error);
      toast.error('Failed to load video');
    }
  };

  const filteredRenders = renders.filter(render => {
    const matchesSearch = render.project_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         render.template_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || render.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'status-processing';
      case 'done':
        return 'status-done';
      case 'error':
        return 'status-error';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
                Render Logs
              </h1>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl">
              Please log in to view your video render logs and status.
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
              <FileText className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to View Render Logs</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Track the progress of your video renders, view status updates, and manage your rendering jobs.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="btn btn-primary btn-lg group hover-lift px-10 py-4"
              >
                <LogIn className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Sign In to Render Logs
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
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
            <p className="text-gray-600 text-sm">Monitor render progress with live status updates</p>
          </div>
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Results</h3>
            <p className="text-gray-600 text-sm">Download completed videos and manage outputs</p>
          </div>
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Handling</h3>
            <p className="text-gray-600 text-sm">View detailed error logs and retry failed renders</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Render Logs</h1>
          <p className="text-gray-600">Monitor your video rendering jobs and their status.</p>
        </div>
        <div className="flex items-center space-x-3">
        <button
          onClick={fetchRenders}
            disabled={loading}
            className="btn btn-outline px-4 py-2"
        >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by project ID or template name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
        >
          <option value="all">All Status</option>
          <option value="processing">Processing</option>
          <option value="done">Completed</option>
          <option value="error">Failed</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{renders.length}</p>
                <p className="text-sm text-gray-500">Total Renders</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {renders.filter(render => render.status === 'processing').length}
                </p>
                <p className="text-sm text-gray-500">Processing</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {renders.filter(render => render.status === 'done').length}
                </p>
                <p className="text-sm text-gray-500">Completed</p>
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
                  {renders.filter(render => render.status === 'error').length}
                </p>
                <p className="text-sm text-gray-500">Failed</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render Logs Table */}
      <div className="flex-1 overflow-hidden">
        <div className="card h-full flex flex-col">
          <div className="card-header flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="card-title">Render History</h3>
                  <p className="card-description">Recent video rendering jobs</p>
                </div>
        </div>
        </div>
      </div>
          <div className="card-content flex-1 overflow-y-auto">
          {filteredRenders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No renders found' : 'No renders yet'}
              </h3>
                <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Start creating templates to see render logs here'
                }
              </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link
                    to="/templates/new"
                    className="btn btn-primary px-8 py-4"
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Create First Template
                  </Link>
                )}
            </div>
          ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Project ID
                    </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Template
                    </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRenders.map((render) => (
                      <tr key={render.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 font-mono">
                            {render.project_id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                          {render.template_name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                          {getStatusIcon(render.status)}
                            <span className={`status-badge ${getStatusColor(render.status)}`}>
                            {render.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(render.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {render.status === 'done' && render.output_url && (
                            <>
                              <button
                                onClick={() => handleViewVideo(render)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="View Video"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <a
                                href={`/api/renders/${render.id}/download`}
                                download={`${render.project_id}.mp4`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-900"
                                title="Download Video"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </>
                          )}
                            {render.status === 'error' && (
                              <button
                                onClick={() => showErrorDetails(render)}
                                className="text-red-600 hover:text-red-900"
                                title="View Error"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            )}
                          {render.status === 'error' && (
                            <button
                              onClick={() => handleRetry(render.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Retry Render"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(render.id, render.project_id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Render"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && selectedRender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Error Details</h3>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                <X className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
                <p className="text-sm text-gray-900 font-mono">{selectedRender.project_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Error Message</label>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {selectedRender.error_message || 'No error message available'}
                  </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowErrorModal(false)}
                className="btn btn-outline px-4 py-2"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleRetry(selectedRender.id);
                    setShowErrorModal(false);
                  }}
                className="btn btn-primary px-4 py-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Video Preview</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                src={videoUrl}
                controls
                className="w-full h-auto max-h-[70vh]"
                autoPlay
                onError={(e) => {
                  console.error('Video error:', e);
                  toast.error('Failed to load video');
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowVideoModal(false)}
                className="btn btn-outline px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenderLogs; 