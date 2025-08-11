import { Request, Response } from 'express';
import { env } from '../config/env';
import fetch from 'node-fetch';
import { getCache, setCache } from '../utils/cache';

export const latestRates = async (req: Request, res: Response) => {
  const base = String(req.query.base || 'USD');
  const symbols = String(req.query.symbols || '');
  const cacheKey = `rates:${base}:${symbols}`;

  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  const url = `${env.rateApiBase}/latest?base=${base}${symbols ? `&symbols=${symbols}` : ''}`;
  const rsp = await fetch(url);
  if (!rsp.ok) return res.status(502).json({ error: 'Rate API error' });
  const data = await rsp.json();

  setCache(cacheKey, data, 1000 * 60 * 60); // 1 hour TTL
  res.json(data);
};