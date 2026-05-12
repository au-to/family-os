import { Router } from 'express';
import * as riskRepo from '../db/repositories/risk-repo.js';
import * as adviceRepo from '../db/repositories/advice-repo.js';
import { generateSummary, generateAdvice } from '../services/agent-service.js';

const router = Router();

// GET /api/agent/summary — overall risk assessment
router.get('/summary', (_req, res, next) => {
  try {
    const risks = riskRepo.findAll();
    const summary = generateSummary(risks);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /api/agent/advice/:riskId — advice for a specific risk
router.get('/advice/:riskId', (req, res, next) => {
  try {
    const risk = riskRepo.findById(req.params.riskId);
    if (!risk) {
      res.status(404).json({ error: '风险不存在' });
      return;
    }

    // Prefer persisted advice; fall back to on-the-fly generation
    let advices = adviceRepo.findByRiskId(req.params.riskId);
    if (advices.length === 0) {
      advices = generateAdvice(risk);
      adviceRepo.createBatch(advices);
    }

    res.json(advices);
  } catch (err) {
    next(err);
  }
});

export default router;
