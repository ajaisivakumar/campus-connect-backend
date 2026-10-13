import { Request, Response } from 'express';
import prisma from '../config/database';

export class HealthController {
  public static async check(_req: Request, res: Response): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime(),
      });
    } catch (err: any) {
      res.status(503).json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: err.message,
      });
    }
  }
}
