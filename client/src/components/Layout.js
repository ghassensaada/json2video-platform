import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Video,
  FileText,
  Key,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Sparkles,
  BookOpen,
  Activity,
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview of your video platform activity' },
    { name: 'Templates', href: '/templates', icon: Video, description: 'Create and manage video templates' },
    { name: 'Render Logs', href: '/renders', icon: FileText, description: 'Track video rendering progress and history' },
    { name: 'API Keys', href: '/apikeys', icon: Key, description: 'Manage API access credentials' },
    { name: 'API Docs', href: '/api-docs', icon: BookOpen, description: 'Comprehensive API documentation' },
    { name: 'API Status', href: '/api-status', icon: Activity, description: 'Monitor service status and performance' },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-white/30 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/30 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                JSON2Video
              </span>
              <div className="flex items-center space-x-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-gray-500 font-medium">AI Video Platform</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto">
          <div className="space-y-3">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-4 text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-md ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon
                    className={`mr-4 h-5 w-5 transition-all duration-200 ${
                      isActive(item.href) 
                        ? 'text-white' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive(item.href) && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-2" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="p-6 border-t border-white/30 flex-shrink-0">
          <div className="flex items-center p-4 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all duration-200">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Enhanced Top bar */}
        <div className="flex-shrink-0 bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 z-10">
          <div className="flex items-center justify-between h-20 px-6 lg:px-8">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
                  <p className="text-sm text-gray-500 leading-tight mt-0.5">
                    {navigation.find(item => isActive(item.href))?.description || 'Overview of your video platform activity'}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-4 p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5">{user?.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-3 z-50 border border-white/30 animate-fade-in-up">
                  <div className="px-6 py-4 text-sm border-b border-gray-100">
                    <p className="font-semibold text-gray-900 leading-tight">{user?.name}</p>
                    <p className="text-gray-500 leading-tight mt-0.5">{user?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center w-full px-6 py-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center w-full px-6 py-4 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-6 lg:p-8">
            <div className="animate-fade-in-up h-full">
          <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Close user menu when clicking outside */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 