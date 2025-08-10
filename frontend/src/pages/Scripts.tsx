import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Script, ScriptCreate } from '../types/api';

const SAMPLE_SCRIPT = `# ---
# name: hello-world
# description: A simple hello world script
# inputs:
#   message: The message to display
# ---

#!/bin/bash
echo "Hello, \${message:-World}!"
echo "Script executed at: $(date)"`;

const Scripts: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<ScriptCreate>({
    name: '',
    description: '',
    content: SAMPLE_SCRIPT,
  });

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getScripts();
      setScripts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load scripts');
      console.error('Error loading scripts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createScript(formData);
      setFormData({ name: '', description: '', content: SAMPLE_SCRIPT });
      setShowCreateForm(false);
      loadScripts();
    } catch (err) {
      setError('Failed to create script');
      console.error('Error creating script:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this script?')) {
      return;
    }
    
    try {
      await apiClient.deleteScript(id);
      loadScripts();
    } catch (err) {
      setError('Failed to delete script');
      console.error('Error deleting script:', err);
    }
  };

  const handleTriggerRun = async (scriptId: number) => {
    const params = prompt('Enter run parameters (JSON format, or leave empty):');
    let parsedParams = {};
    
    if (params && params.trim()) {
      try {
        parsedParams = JSON.parse(params);
      } catch (err) {
        alert('Invalid JSON format');
        return;
      }
    }

    try {
      await apiClient.createRun(scriptId, { params: parsedParams });
      alert('Run triggered successfully!');
    } catch (err) {
      setError('Failed to trigger run');
      console.error('Error triggering run:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading scripts...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Scripts</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create Script'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Script Content:</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Script
            </button>
          </form>
        )}

        {error && <div className="error">{error}</div>}
      </div>

      <div className="card">
        <h3>Existing Scripts</h3>
        {scripts.length === 0 ? (
          <p>No scripts found. Create your first script above!</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scripts.map((script) => (
                <tr key={script.id}>
                  <td>{script.name}</td>
                  <td>{script.description || 'No description'}</td>
                  <td>{new Date(script.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleTriggerRun(script.id)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Run
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(script.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Scripts;