import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { CreateMemberSchema } from '../../shared/schemas.js';
import * as memberRepo from '../db/repositories/member-repo.js';

const router = Router();

// GET /api/members — list all members
router.get('/', (_req, res, next) => {
  try {
    const members = memberRepo.findAll();
    res.json(members);
  } catch (err) {
    next(err);
  }
});

// POST /api/members — create member
router.post('/', validate(CreateMemberSchema), (req, res, next) => {
  try {
    const member = memberRepo.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/members/:id — delete member
router.delete('/:id', (req, res, next) => {
  try {
    const deleted = memberRepo.remove(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: '成员不存在' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
