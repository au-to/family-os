import { z } from 'zod';

// ── Enums ──────────────────────────────────────────
export const RiskCategoryEnum = z.enum([
  'financial',
  'health',
  'safety',
  'legal',
  'property',
]);

export const RiskLevelEnum = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

export const RiskStatusEnum = z.enum([
  'active',
  'mitigated',
  'closed',
]);

// ── Risk Schemas ───────────────────────────────────
export const CreateRiskSchema = z.object({
  category: RiskCategoryEnum,
  title: z.string().min(1, '标题不能为空'),
  description: z.string().default(''),
  probability: z
    .number()
    .int('概率必须是整数')
    .min(1, '概率必须在 1-5 之间')
    .max(5, '概率必须在 1-5 之间'),
  impact: z
    .number()
    .int('影响必须是整数')
    .min(1, '影响必须在 1-5 之间')
    .max(5, '影响必须在 1-5 之间'),
  status: RiskStatusEnum.default('active'),
  mitigation: z.string().default(''),
  memberId: z.string().optional(),
});

export const UpdateRiskSchema = z.object({
  category: RiskCategoryEnum.optional(),
  title: z.string().min(1, '标题不能为空').optional(),
  description: z.string().optional(),
  probability: z.number().int().min(1).max(5).optional(),
  impact: z.number().int().min(1).max(5).optional(),
  status: RiskStatusEnum.optional(),
  mitigation: z.string().optional(),
  memberId: z.string().optional().nullable(),
});

// ── Member Schemas ─────────────────────────────────
export const CreateMemberSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  role: z.string().min(1, '角色不能为空'),
  age: z
    .number()
    .int('年龄必须是整数')
    .min(0, '年龄必须在 0-150 之间')
    .max(150, '年龄必须在 0-150 之间'),
});

// ── Query Schemas ──────────────────────────────────
export const QueryParamsSchema = z.object({
  category: z.string().optional(),
  level: z.string().optional(),
  status: z.string().optional(),
  sort: z.enum(['score', 'newest']).optional(),
});

// ── Inferred Types ─────────────────────────────────
export type CreateRiskInput = z.infer<typeof CreateRiskSchema>;
export type UpdateRiskInput = z.infer<typeof UpdateRiskSchema>;
export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type QueryParams = z.infer<typeof QueryParamsSchema>;
