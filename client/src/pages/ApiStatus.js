import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  WifiOff,
  Server,
  Globe,
  RefreshCw,
  LogIn,
  TrendingUp,
  Minus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ApiStatus = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const [statusData] = useState({
    overall: 'operational',
    services: [
      {
        name: 'API Server',
        status: 'operational',
        responseTime: 45,
        uptime: 99.98,
        lastIncident: null,
      },
      {
        name: 'Templates Service',
        status: 'operational',
        responseTime: 78,
        uptime: 99.95,
        lastIncident: null,
      },
      {
        name: 'Render Engine',
        status: 'operational',
        responseTime: 156,
        uptime: 99.92,
        lastIncident: null,
      },
      {
        name: 'Database',
        status: 'operational',
        responseTime: 23,
        uptime: 99.99,
        lastIncident: null,
      },
      {
        name: 'Authentication',
        status: 'operational',
        responseTime: 34,
        uptime: 99.97,
        lastIncident: null,
      },
      {
        name: 'API Keys Service',
        status: 'operational',
        responseTime: 28,
        uptime: 99.99,
        lastIncident: null,
      },
    ],
    incidents: [],
    metrics: {
      totalRequests: 1247503,
      averageResponseTime: 71,
      errorRate: 0.02,
      activeUsers: 1247,
    },
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus();
    }
  }, [isAuthenticated]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your status API
      // const response = await axios.get('/api/status');
      // setStatusData(response.data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastUpdated(new Date());
      toast.success('Status updated');
    } catch (error) {
      console.error('Error fetching status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'outage':
        return <WifiOff className="w-5 h-5 text-red-600" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'outage':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseTimeColor = (time) => {
    if (time < 100) return 'text-green-600';
    if (time < 200) return 'text-yellow-600';
    return 'text-red-600';
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
            <Activity className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Status</h2>
          <p className="text-gray-600 mb-8">
            Please log in to view detailed API status and performance metrics.
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
          <h1 className="text-2xl font-bold text-gray-900">API Status</h1>
          <p className="text-gray-600">Real-time status of all AI Video Platform services</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="btn btn-outline px-4 py-2"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="card flex-shrink-0">
        <div className="card-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStatusIcon(statusData.overall)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">All Systems Operational</h3>
                <p className="text-sm text-gray-500">All services are running normally</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">99.96%</p>
              <p className="text-sm text-gray-500">Uptime (30 days)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {statusData.metrics.totalRequests.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Requests (24h)</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${getResponseTimeColor(statusData.metrics.averageResponseTime)}`}>
                  {statusData.metrics.averageResponseTime}ms
                </p>
                <p className="text-sm text-gray-500">Avg Response Time</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {statusData.metrics.errorRate}%
                </p>
                <p className="text-sm text-gray-500">Error Rate</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {statusData.metrics.activeUsers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Active Users</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="flex-1 overflow-hidden">
        <div className="card h-full flex flex-col">
          <div className="card-header flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <Server className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="card-title">Service Status</h3>
                <p className="card-description">Real-time status of all API services</p>
              </div>
            </div>
          </div>
          <div className="card-content flex-1 overflow-y-auto">
            <div className="space-y-4">
              {statusData.services.map((service, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                          <span>Uptime: {service.uptime}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getResponseTimeColor(service.responseTime)}`}>
                        {service.responseTime}ms
                      </p>
                      <p className="text-sm text-gray-500">Response Time</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      {statusData.incidents.length > 0 && (
        <div className="card flex-shrink-0">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="card-title">Recent Incidents</h3>
                <p className="card-description">Past service disruptions and resolutions</p>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {statusData.incidents.map((incident, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{incident.title}</h4>
                      <p className="text-sm text-gray-600">{incident.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(incident.startTime).toLocaleString()} - {new Date(incident.endTime).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      incident.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Legend */}
      <div className="card flex-shrink-0">
        <div className="card-content">
          <h4 className="font-semibold text-gray-900 mb-3">Status Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-gray-600">Degraded</span>
            </div>
            <div className="flex items-center space-x-2">
              <WifiOff className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600">Outage</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus; 