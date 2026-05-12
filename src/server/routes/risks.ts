import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { CreateRiskSchema, UpdateRiskSchema } from '../../shared/schemas.js';
import * as riskRepo from '../db/repositories/risk-repo.js';
import * as adviceRepo from '../db/repositories/advice-repo.js';
import { generateAdvice } from '../services/agent-service.js';

const router = Router();

// GET /api/risks — list with optional filters
router.get('/', (req, res, next) => {
  try {
    const { category, level, status, sort } = req.query as Record<
      string,
      string | undefined
    >;
    const risks = riskRepo.findAll({ category, level, status, sort });
    res.json(risks);
  } catch (err) {
    next(err);
  }
});

// GET /api/risks/dashboard — aggregated stats
router.get('/dashboard', (_req, res, next) => {
  try {
    const data = riskRepo.getDashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/risks/:id — single risk
router.get('/:id', (req, res, next) => {
  try {
    const risk = riskRepo.findById(req.params.id);
    if (!risk) {
      res.status(404).json({ error: '风险不存在' });
      return;
    }
    res.json(risk);
  } catch (err) {
    next(err);
  }
});

// POST /api/risks — create risk + auto-generate advice
router.post('/', validate(CreateRiskSchema), (req, res, next) => {
  try {
    const risk = riskRepo.create(req.body);

    // Persist rule-based advice alongside the risk
    const advices = generateAdvice(risk);
    adviceRepo.createBatch(advices);

    res.status(201).json({ risk, advice: advices });
  } catch (err) {
    next(err);
  }
});

// PUT /api/risks/:id — update risk
router.put('/:id', validate(UpdateRiskSchema), (req, res, next) => {
  try {
    const updated = riskRepo.update(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: '风险不存在' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/risks/:id
router.delete('/:id', (req, res, next) => {
  try {
    const deleted = riskRepo.remove(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: '风险不存在' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/risks/:id/advice — persisted advice, fallback to generated
router.get('/:id/advice', (req, res, next) => {
  try {
    const risk = riskRepo.findById(req.params.id);
    if (!risk) {
      res.status(404).json({ error: '风险不存在' });
      return;
    }

    let advices = adviceRepo.findByRiskId(req.params.id);
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
