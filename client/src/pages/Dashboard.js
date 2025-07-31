import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Video,
  Play,
  TrendingUp,
  Key,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles,
  LogIn,
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    templates: 0,
    renders: { total: 0, processing: 0, done: 0, error: 0 },
    apiKeys: 0,
  });
  const [recentRenders, setRecentRenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch templates count
      const templatesResponse = await axios.get('/api/templates');
      const templatesCount = templatesResponse.data.templates?.length || 0;

      // Fetch render stats
      const rendersResponse = await axios.get('/api/renders');
      const renders = rendersResponse.data.renders || [];
      
      // Calculate render stats
      const renderStats = {
        total: renders.length,
        processing: renders.filter(r => r.status === 'processing').length,
        done: renders.filter(r => r.status === 'done').length,
        error: renders.filter(r => r.status === 'error').length,
      };

      // Fetch API keys count
      const apiKeysResponse = await axios.get('/api/apikeys');
      const apiKeysCount = apiKeysResponse.data.apiKeys?.length || 0;

      setStats({
        templates: templatesCount,
        renders: renderStats,
        apiKeys: apiKeysCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view dashboard');
        navigate('/login');
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchRecentRenders = useCallback(async () => {
    try {
      const response = await axios.get('/api/renders');
      const recentRendersData = (response.data.renders || []).slice(0, 5);
      setRecentRenders(recentRendersData);
    } catch (error) {
      console.error('Error fetching recent renders:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view recent renders');
        navigate('/login');
      } else {
        toast.error('Failed to load recent renders');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchStats();
        fetchRecentRenders();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, fetchStats, fetchRecentRenders]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
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
              <h1 className="text-3xl font-bold heading-gradient">
                Dashboard
              </h1>
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-float">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl">
              Welcome to JSON2Video! Please log in to access your dashboard.
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
              <LogIn className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to Your Dashboard</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Access your video templates, render logs, and API keys. Create amazing videos with our AI-powered platform.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="btn btn-primary btn-lg group hover-lift px-10 py-4"
              >
                <LogIn className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Sign In to Dashboard
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
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Video Templates</h3>
            <p className="text-gray-600 text-sm">Create professional video templates with our AI-powered editor</p>
          </div>
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Rendering</h3>
            <p className="text-gray-600 text-sm">Render high-quality videos quickly with our optimized engine</p>
          </div>
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">API Access</h3>
            <p className="text-gray-600 text-sm">Integrate video generation into your applications</p>
          </div>
        </div>
      </div>
    );
    }

  // Show loading while fetching data
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
      {/* Enhanced Header */}
      <div className="flex items-center justify-between pt-4 flex-shrink-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold heading-gradient">
              Dashboard
            </h1>
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-float">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl">
            Welcome back! Here's what's happening with your video projects. 
            <span className="text-indigo-600 font-medium"> Ready to create something amazing?</span>
          </p>
        </div>
        <Link
          to="/templates/new"
          className="btn btn-primary btn-lg group hover-lift px-8 py-4 flex-shrink-0"
        >
          <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
          New Template
        </Link>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-shrink-0">
        <div className="card hover-lift group">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.templates}</p>
                <p className="text-sm text-gray-500">Video templates created</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Video className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card hover-lift group">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.renders.total}</p>
                <p className="text-sm text-gray-500">Videos processed</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card hover-lift group">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.renders.total > 0 ? Math.round((stats.renders.done / stats.renders.total) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-500">Successful renders</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card hover-lift group">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.apiKeys}</p>
                <p className="text-sm text-gray-500">Active integrations</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Key className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Render Status */}
        <div className="card flex flex-col">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
            <h3 className="card-title">Render Status</h3>
            <p className="card-description">Current render job status</p>
              </div>
            </div>
          </div>
          <div className="card-content flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Processing</p>
                    <p className="text-sm text-gray-500">Videos currently being rendered</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats.renders.processing}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Completed</p>
                    <p className="text-sm text-gray-500">Successfully rendered videos</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.renders.done}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Failed</p>
                    <p className="text-sm text-gray-500">Renders that encountered errors</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats.renders.error}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card flex flex-col">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
            <h3 className="card-title">Quick Actions</h3>
            <p className="card-description">Common tasks and shortcuts</p>
              </div>
            </div>
          </div>
          <div className="card-content flex-1 overflow-y-auto">
            <div className="space-y-4">
              <Link
                to="/templates/new"
                className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">Create New Template</p>
                  <p className="text-sm text-gray-500">Start building a video template</p>
                </div>
                <div className="text-indigo-500 group-hover:translate-x-1 transition-transform duration-200">
                  →
                </div>
              </Link>
              
              <Link
                to="/templates"
                className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">Manage Templates</p>
                  <p className="text-sm text-gray-500">Edit existing templates</p>
                </div>
                <div className="text-green-500 group-hover:translate-x-1 transition-transform duration-200">
                  →
                </div>
              </Link>
              
              <Link
                to="/apikeys"
                className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 hover:from-orange-100 hover:to-yellow-100 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">API Keys</p>
                  <p className="text-sm text-gray-500">Manage your API access</p>
                </div>
                <div className="text-orange-500 group-hover:translate-x-1 transition-transform duration-200">
                  →
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Renders */}
      {recentRenders.length > 0 && (
        <div className="card flex-shrink-0">
        <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            <div>
              <h3 className="card-title">Recent Renders</h3>
                <p className="card-description">Latest video processing jobs</p>
            </div>
          </div>
        </div>
        <div className="card-content">
            <div className="space-y-3">
                  {recentRenders.map((render) => (
                <div key={render.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                          {getStatusIcon(render.status)}
                    <div>
                      <p className="font-medium text-gray-900">{render.template_name || 'Untitled Template'}</p>
                      <p className="text-sm text-gray-500">{render.project_id}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(render.created_at).toLocaleDateString()}
                          </span>
                        </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 