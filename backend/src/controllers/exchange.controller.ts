import { Request, Response } from 'express';
import { env } from '../config/env';
import fetch from 'node-fetch';
import { getCache, setCache } from '../utils/cache';

export const latestRates = async (req: Request, res: Response) => {
  try {
    const base = String(req.query.base || 'USD');
    const symbols = String(req.query.symbols || '');
    const cacheKey = `rates:${base}:${symbols}`;

    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const url = `${env.rateApiBase}/latest?base=${base}${symbols ? `&symbols=${symbols}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Rate API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    setCache(cacheKey, data, 1000 * 60 * 60); // 1 hour TTL
    return res.json(data);
    
  } catch (error) {
    console.error('Error fetching rates:', error);
    return res.status(502).json({ 
      error: 'Failed to fetch exchange rates',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};