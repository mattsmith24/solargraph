/**
 * Get the API base URL from environment variables
 * Defaults to http://localhost:4001 if not set
 */
export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL || 'http://localhost:4001';
}
