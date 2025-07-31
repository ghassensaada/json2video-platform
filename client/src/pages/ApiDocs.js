import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Code,
  Copy,
  CheckCircle,
  AlertCircle,
  Play,
  FileText,
  Key,
  LogIn,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// Determine API base URL for display purposes in docs.
// Uses the same resolution logic as AuthContext (axios.defaults.baseURL already set).
// Fallback to window origin or http://localhost:5000 in dev.
const BASE_URL = `${axios.defaults?.baseURL || ''}/api`;

const ApiDocs = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    authentication: true,
    templates: false,
    renders: false,
    examples: false,
    apikeys: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
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
            <BookOpen className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Documentation</h2>
          <p className="text-gray-600 mb-8">
            Please log in to access the complete API documentation and examples.
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
          <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-600">Complete reference for the AI Video Platform API</p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="https://github.com/your-repo/api-examples"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline px-4 py-2"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Examples
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">4</p>
                <p className="text-sm text-gray-500">API Endpoints</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">99.9%</p>
                <p className="text-sm text-gray-500">Uptime</p>
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
                <p className="text-2xl font-bold text-orange-600">&lt;200ms</p>
                <p className="text-sm text-gray-500">Response Time</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">REST</p>
                <p className="text-sm text-gray-500">API Type</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Base URL */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Base URL</h3>
              <p className="card-description">All API requests should be made to this base URL</p>
            </div>
            <div className="card-content">
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span>{BASE_URL}</span>
                  <button
                    onClick={() => copyToClipboard(BASE_URL)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="card">
            <div className="card-header">
              <button
                onClick={() => toggleSection('authentication')}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="card-title">Authentication</h3>
                    <p className="card-description">How to authenticate your API requests</p>
                  </div>
                </div>
                {expandedSections.authentication ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {expandedSections.authentication && (
              <div className="card-content space-y-4">
                <p className="text-gray-600">
                  All API requests require authentication using an API key. Include your API key in the request headers.
                </p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Header Authentication</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span>Authorization: Bearer YOUR_API_KEY</span>
                      <button
                        onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY')}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">API Key Authentication (External API)</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span>X-API-Key: YOUR_API_KEY</span>
                      <button
                        onClick={() => copyToClipboard('X-API-Key: YOUR_API_KEY')}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Example Request</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X GET ${BASE_URL}/templates \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Templates API */}
          <div className="card">
            <div className="card-header">
              <button
                onClick={() => toggleSection('templates')}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="card-title">Templates API</h3>
                    <p className="card-description">Manage video templates</p>
                  </div>
                </div>
                {expandedSections.templates ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {expandedSections.templates && (
              <div className="card-content space-y-6">
                {/* GET /templates */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
                    <span className="font-mono text-sm">/templates</span>
                  </div>
                  <p className="text-gray-600 mb-3">Retrieve all templates</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X GET ${BASE_URL}/templates \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* POST /templates */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">POST</span>
                    <span className="font-mono text-sm">/templates</span>
                  </div>
                  <p className="text-gray-600 mb-3">Create a new template</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X POST ${BASE_URL}/templates \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Template",
    "description": "A sample video template",
    "template_data": {
      "width": 1920,
      "height": 1080,
      "duration": 10,
      "elements": []
    },
    "thumbnail_url": "https://example.com/thumbnail.jpg"
  }'`}
                    </pre>
                  </div>
                </div>

                {/* PUT /templates/{id} */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">PUT</span>
                    <span className="font-mono text-sm">/templates/{'{id}'}</span>
                  </div>
                  <p className="text-gray-600 mb-3">Update a template</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X PUT ${BASE_URL}/templates/123 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Template",
    "description": "Updated description",
    "template_data": {
      "width": 1920,
      "height": 1080,
      "duration": 15,
      "elements": []
    }
  }'`}
                    </pre>
                  </div>
                </div>

                {/* DELETE /templates/{id} */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">DELETE</span>
                    <span className="font-mono text-sm">/templates/{'{id}'}</span>
                  </div>
                  <p className="text-gray-600 mb-3">Delete a template</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X DELETE ${BASE_URL}/templates/123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* POST /templates/{id}/duplicate */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">POST</span>
                    <span className="font-mono text-sm">/templates/{'{id}'}/duplicate</span>
                  </div>
                  <p className="text-gray-600 mb-3">Duplicate a template</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X POST ${BASE_URL}/templates/123/duplicate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Template Copy"
  }'`}
                    </pre>
                  </div>
                </div>

                {/* GET /templates/{id} */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
                    <span className="font-mono text-sm">/templates/{'{id}'}</span>
                  </div>
                  <p className="text-gray-600 mb-3">Retrieve a specific template</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X GET ${BASE_URL}/templates/123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Renders API */}
          <div className="card">
            <div className="card-header">
              <button
                onClick={() => toggleSection('renders')}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                    <Play className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="card-title">Renders API</h3>
                    <p className="card-description">Create and manage video renders</p>
                  </div>
                </div>
                {expandedSections.renders ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {expandedSections.renders && (
              <div className="card-content space-y-6">
                {/* POST /renders */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">POST</span>
                    <span className="font-mono text-sm">/renders</span>
                  </div>
                  <p className="text-gray-600 mb-3">Create a new video render</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X POST ${BASE_URL}/renders \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "123",
    "render_data": {
      "text": "Hello World",
      "background_color": "#000000"
    },
    "resolution": "1920x1080"
  }'`}
                    </pre>
                  </div>
                </div>

                {/* GET /renders */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
                    <span className="font-mono text-sm">/renders</span>
                  </div>
                  <p className="text-gray-600 mb-3">List all renders</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X GET ${BASE_URL}/renders \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* GET /renders/{id} */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
                    <span className="font-mono text-sm">/renders/{'{id}'}</span>
                  </div>
                  <p className="text-gray-600 mb-3">Get render status and details</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X GET ${BASE_URL}/renders/456 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* DELETE /renders/{id} */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">DELETE</span>
                    <span className="font-mono text-sm">/renders/{'{id}'}</span>
                  </div>
                  <p className="text-gray-600 mb-3">Delete a render</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X DELETE ${BASE_URL}/renders/456 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* POST /renders/{id}/retry */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">POST</span>
                    <span className="font-mono text-sm">/renders/{'{id}'}/retry</span>
                  </div>
                  <p className="text-gray-600 mb-3">Retry a failed render</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X POST ${BASE_URL}/renders/456/retry \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* GET /renders/stats/summary */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
                    <span className="font-mono text-sm">/renders/stats/summary</span>
                  </div>
                  <p className="text-gray-600 mb-3">Get render statistics</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X GET ${BASE_URL}/renders/stats/summary \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Code Examples */}
          <div className="card">
            <div className="card-header">
              <button
                onClick={() => toggleSection('examples')}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Code className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="card-title">Code Examples</h3>
                    <p className="card-description">Ready-to-use code examples</p>
                  </div>
                </div>
                {expandedSections.examples ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {expandedSections.examples && (
              <div className="card-content space-y-6">
                {/* JavaScript Example */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">JavaScript/Node.js</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'http://localhost:5001/api';

// Create a render
async function createRender() {
  try {
    const response = await axios.post(\`\${BASE_URL}/renders\`, {
      template_id: '123',
      project_id: 'my-project',
      data: {
        text: 'Hello from API!',
        background_color: '#ff0000'
      }
    }, {
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Render created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

createRender();`}
                    </pre>
                  </div>
                </div>

                {/* Python Example */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Python</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`import requests

API_KEY = 'your_api_key_here'
BASE_URL = 'http://localhost:5001/api'

def create_render():
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'template_id': '123',
        'project_id': 'my-project',
        'data': {
            'text': 'Hello from Python!',
            'background_color': '#00ff00'
        }
    }
    
    try:
        response = requests.post(f'{BASE_URL}/renders', 
                               json=data, headers=headers)
        response.raise_for_status()
        print('Render created:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Error:', e)

create_render()`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* API Keys */}
          <div className="card">
            <div className="card-header">
              <button
                onClick={() => toggleSection('apikeys')}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="card-title">API Keys</h3>
                    <p className="card-description">Manage API keys for external access</p>
                  </div>
                </div>
                {expandedSections.apikeys ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {expandedSections.apikeys && (
              <div className="card-content space-y-6">
                {/* GET /apikeys */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
                    <span className="font-mono text-sm">/apikeys</span>
                  </div>
                  <p className="text-gray-600 mb-3">List all API keys</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X GET ${BASE_URL}/apikeys \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* POST /apikeys */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">POST</span>
                    <span className="font-mono text-sm">/apikeys</span>
                  </div>
                  <p className="text-gray-600 mb-3">Generate a new API key</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X POST ${BASE_URL}/apikeys \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "key_name": "My API Key"
  }'`}
                    </pre>
                  </div>
                </div>

                {/* DELETE /apikeys/{id} */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">DELETE</span>
                    <span className="font-mono text-sm">/apikeys/{'{id}'}</span>
                  </div>
                  <p className="text-gray-600 mb-3">Delete an API key</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X DELETE ${BASE_URL}/apikeys/123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* PUT /apikeys/{id}/toggle */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">PUT</span>
                    <span className="font-mono text-sm">/apikeys/{'{id}'}/toggle</span>
                  </div>
                  <p className="text-gray-600 mb-3">Activate/deactivate an API key</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X PUT ${BASE_URL}/apikeys/123/toggle \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* POST /apikeys/{id}/regenerate */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">POST</span>
                    <span className="font-mono text-sm">/apikeys/{'{id}'}/regenerate</span>
                  </div>
                  <p className="text-gray-600 mb-3">Regenerate an API key</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X POST ${BASE_URL}/apikeys/123/regenerate \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>

                {/* POST /apikeys/render (External API) */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">POST</span>
                    <span className="font-mono text-sm">/apikeys/render</span>
                  </div>
                  <p className="text-gray-600 mb-3">Create render using API key (External API)</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
{`curl -X POST ${BASE_URL}/apikeys/render \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "123",
    "render_data": {
      "text": "Hello from External API",
      "background_color": "#ff0000"
    },
    "resolution": "1920x1080"
  }'`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Codes */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="card-title">Error Codes</h3>
                  <p className="card-description">Common API error responses</p>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">400</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Bad Request - Invalid parameters</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">401</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Unauthorized - Invalid API key</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">404</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Not Found - Resource doesn't exist</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">429</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Too Many Requests - Rate limit exceeded</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">500</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Internal Server Error</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs; 