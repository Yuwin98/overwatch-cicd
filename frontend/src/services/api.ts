import { Script, ScriptCreate, Run, RunCreate } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text() as Promise<T>;
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string }>('/health');
  }

  // Scripts
  async getScripts(): Promise<Script[]> {
    return this.request<Script[]>('/scripts');
  }

  async getScript(id: number): Promise<Script> {
    return this.request<Script>(`/scripts/${id}`);
  }

  async createScript(script: ScriptCreate): Promise<Script> {
    return this.request<Script>('/scripts', {
      method: 'POST',
      body: JSON.stringify(script),
    });
  }

  async deleteScript(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/scripts/${id}`, {
      method: 'DELETE',
    });
  }

  // Runs
  async getRuns(): Promise<Run[]> {
    return this.request<Run[]>('/runs');
  }

  async getRun(id: number): Promise<Run> {
    return this.request<Run>(`/runs/${id}`);
  }

  async createRun(scriptId: number, runData: RunCreate): Promise<Run> {
    return this.request<Run>(`/runs/script/${scriptId}`, {
      method: 'POST',
      body: JSON.stringify(runData),
    });
  }

  async getRunLogs(id: number): Promise<string> {
    return this.request<string>(`/runs/${id}/logs`);
  }
}

export const apiClient = new ApiClient();