const FASTAPI_URL = 'http://localhost:8000';

export const apiService = {
  async startSimulation(speedSeconds: number, includeFraudOnly: boolean = false): Promise<void> {
    const response = await fetch(`${FASTAPI_URL}/api/v1/simulation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        speed_seconds: speedSeconds,
        include_fraud_only: includeFraudOnly,
      }),
    });
    if (!response.ok) throw new Error('Failed to start simulation');
  },

  async stopSimulation(): Promise<void> {
    const response = await fetch(`${FASTAPI_URL}/api/v1/simulation/stop`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to stop simulation');
  },
};