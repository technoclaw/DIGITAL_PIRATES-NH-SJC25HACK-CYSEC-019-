/**
 * Global in-memory store for analysis results (the "back-office clipboard")
 * This ensures both callback and check-status routes use the same Map instance
 * 
 * In production, consider using:
 * - Redis for distributed systems
 * - Database with polling
 * - WebSocket connections for real-time updates
 */
export const analysisResults = new Map<string, any>();
