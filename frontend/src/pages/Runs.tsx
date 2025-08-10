import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Run, Script } from '../types/api';

const Runs: React.FC = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadRuns, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [runsData, scriptsData] = await Promise.all([
        apiClient.getRuns(),
        apiClient.getScripts(),
      ]);
      setRuns(runsData);
      setScripts(scriptsData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRuns = async () => {
    try {
      const data = await apiClient.getRuns();
      setRuns(data);
    } catch (err) {
      console.error('Error refreshing runs:', err);
    }
  };

  const loadLogs = async (run: Run) => {
    setSelectedRun(run);
    setLogsLoading(true);
    try {
      const logsData = await apiClient.getRunLogs(run.id);
      setLogs(logsData);
    } catch (err) {
      setLogs('Failed to load logs');
      console.error('Error loading logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const getScriptName = (targetId: number) => {
    const script = scripts.find(s => s.id === targetId);
    return script ? script.name : `Script ${targetId}`;
  };

  const getStatusClass = (status: string) => {
    return `status ${status.toLowerCase()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startedAt?: string, finishedAt?: string) => {
    if (!startedAt) return 'Not started';
    if (!finishedAt) return 'Running...';
    
    const start = new Date(startedAt);
    const end = new Date(finishedAt);
    const duration = end.getTime() - start.getTime();
    
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    return `${Math.round(duration / 60000)}m ${Math.round((duration % 60000) / 1000)}s`;
  };

  if (loading) {
    return <div className="loading">Loading runs...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Runs</h2>
          <button className="btn btn-secondary" onClick={loadRuns}>
            Refresh
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedRun ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3>Run History</h3>
          {runs.length === 0 ? (
            <p>No runs found. Trigger a script run from the Scripts page!</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Script</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Started</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} style={{ cursor: 'pointer' }}>
                    <td>{run.id}</td>
                    <td>{getScriptName(run.target_id)}</td>
                    <td>
                      <span className={getStatusClass(run.status)}>
                        {run.status}
                      </span>
                    </td>
                    <td>{formatDuration(run.started_at, run.finished_at)}</td>
                    <td>
                      {run.started_at ? formatDate(run.started_at) : 'Not started'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => loadLogs(run)}
                      >
                        View Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedRun && (
          <div className="card">
            <h3>Run Details - #{selectedRun.id}</h3>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Script:</strong> {getScriptName(selectedRun.target_id)}</p>
              <p><strong>Status:</strong> <span className={getStatusClass(selectedRun.status)}>{selectedRun.status}</span></p>
              <p><strong>Created:</strong> {formatDate(selectedRun.created_at)}</p>
              {selectedRun.started_at && (
                <p><strong>Started:</strong> {formatDate(selectedRun.started_at)}</p>
              )}
              {selectedRun.finished_at && (
                <p><strong>Finished:</strong> {formatDate(selectedRun.finished_at)}</p>
              )}
              <p><strong>Duration:</strong> {formatDuration(selectedRun.started_at, selectedRun.finished_at)}</p>
              {selectedRun.params && Object.keys(selectedRun.params).length > 0 && (
                <div>
                  <strong>Parameters:</strong>
                  <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                    {JSON.stringify(selectedRun.params, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <h4>Logs</h4>
            {logsLoading ? (
              <div>Loading logs...</div>
            ) : (
              <div className="logs">
                {logs || 'No logs available yet.'}
              </div>
            )}
            
            <button
              className="btn btn-secondary"
              onClick={() => loadLogs(selectedRun)}
              style={{ marginTop: '1rem' }}
            >
              Refresh Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Runs;