import type { Risk, AgentAdvice, RiskCategory } from '../../shared/types.js';
import { CATEGORY_LABELS } from '../../shared/types.js';
import { v4 as uuid } from 'uuid';

const CATEGORY_ADVICE: Record<RiskCategory, (risk: Risk) => string[]> = {
  financial: (r) => {
    const advices: string[] = [];
    if (r.impact >= 4) advices.push('建议购买相应保险产品以转移高影响财务风险');
    if (r.probability >= 3) advices.push('建议建立紧急基金，目标覆盖3-6个月家庭开支');
    if (r.score >= 15) advices.push('建议咨询专业财务顾问，制定资产配置方案');
    return advices;
  },
  health: (r) => {
    const advices: string[] = [];
    if (r.probability >= 3) advices.push('建议安排定期体检，早发现早干预');
    if (r.impact >= 4) advices.push('检查健康保险覆盖范围是否充足');
    if (r.score >= 15) advices.push('建立家庭健康档案，记录病史和过敏信息');
    return advices;
  },
  safety: (r) => {
    const advices: string[] = [];
    advices.push('制定家庭安全检查清单，定期排查隐患');
    if (r.impact >= 4) advices.push('安装必要的安全设备（烟雾报警器、监控等）');
    advices.push('制定家庭应急预案，确保所有成员知晓逃生路线');
    return advices;
  },
  legal: (r) => {
    const advices: string[] = [];
    if (r.impact >= 3) advices.push('建议咨询专业律师，了解相关法律规定');
    if (r.score >= 12) advices.push('检查并更新遗嘱、授权书等重要法律文件');
    advices.push('整理并妥善保管家庭重要证件和合同文件');
    return advices;
  },
  property: (r) => {
    const advices: string[] = [];
    if (r.impact >= 4) advices.push('确认财产保险保额是否充足，及时续保');
    if (r.probability >= 3) advices.push('制定定期维护计划，预防财产价值贬损');
    if (r.score >= 12) advices.push('评估资产配置合理性，避免单一资产集中风险');
    return advices;
  },
};

function scoreAdvice(risk: Risk): string[] {
  const advices: string[] = [];
  if (risk.score >= 20) advices.push('【严重警告】风险评分极高，请立即制定应急方案并优先处理');
  else if (risk.score >= 15) advices.push('【高度关注】建议本周内制定详细缓解计划');
  else if (risk.score >= 8) advices.push('【中等关注】建议本月内完成风险评估并记录缓解措施');
  else advices.push('【常规监控】保持定期关注，按计划进行监控');
  return advices;
}

export function generateAdvice(risk: Risk): AgentAdvice[] {
  const advices: AgentAdvice[] = [];
  const now = new Date().toISOString();

  const scoreAdvices = scoreAdvice(risk);
  scoreAdvices.forEach((content, i) => {
    advices.push({
      id: uuid(),
      riskId: risk.id,
      content,
      priority: 10 - i,
      createdAt: now,
    });
  });

  const catAdvices = CATEGORY_ADVICE[risk.category](risk);
  catAdvices.forEach((content, i) => {
    advices.push({
      id: uuid(),
      riskId: risk.id,
      content,
      priority: 5 - i,
      createdAt: now,
    });
  });

  if (!risk.mitigation && risk.score >= 10) {
    advices.push({
      id: uuid(),
      riskId: risk.id,
      content: '尚未填写缓解措施，请尽快补充应对方案',
      priority: 1,
      createdAt: now,
    });
  }

  return advices.sort((a, b) => b.priority - a.priority);
}

export interface AgentSummary {
  overallAssessment: string;
  topConcerns: string[];
  recommendations: string[];
  categoryInsights: { category: RiskCategory; label: string; insight: string }[];
}

export function generateSummary(risks: Risk[]): AgentSummary {
  const active = risks.filter(r => r.status === 'active');
  const critical = active.filter(r => r.level === 'critical');
  const high = active.filter(r => r.level === 'high');
  const totalScore = active.reduce((s, r) => s + r.score, 0);
  const avgScore = active.length > 0 ? totalScore / active.length : 0;

  let overallAssessment: string;
  if (critical.length > 0) {
    overallAssessment = `家庭风险管理存在${critical.length}项严重风险，需要立即采取行动。当前活跃风险${active.length}项，平均风险评分${avgScore.toFixed(1)}。`;
  } else if (high.length > 0) {
    overallAssessment = `家庭有${high.length}项高风险需要关注，整体活跃风险${active.length}项。建议优先处理高风险项目。`;
  } else if (avgScore > 10) {
    overallAssessment = `家庭风险整体处于中等水平，${active.length}项活跃风险需要持续管理。`;
  } else {
    overallAssessment = `家庭风险管理状况良好，${active.length}项活跃风险均在可控范围内。`;
  }

  const topConcerns = [...critical, ...high]
    .slice(0, 5)
    .map(r => `[${CATEGORY_LABELS[r.category]}] ${r.title} (评分: ${r.score})`);

  const recommendations: string[] = [];
  if (critical.length > 0) recommendations.push(`优先处理${critical.length}项严重风险，制定详细应急预案`);
  if (active.filter(r => !r.mitigation).length > 3) recommendations.push('超过3项活跃风险缺少缓解措施，请尽快补充');
  if (avgScore > 12) recommendations.push('整体风险评分偏高，建议进行一次全面的家庭风险审计');

  const categories: RiskCategory[] = ['financial', 'health', 'safety', 'legal', 'property'];
  const categoryInsights = categories.map(cat => {
    const catRisks = active.filter(r => r.category === cat);
    const criticalCount = catRisks.filter(r => r.level === 'critical').length;
    let insight: string;
    if (catRisks.length === 0) insight = '暂无已识别风险';
    else if (criticalCount > 0) insight = `${catRisks.length}项风险中有${criticalCount}项严重风险，需紧急处理`;
    else insight = `${catRisks.length}项风险，整体可控`;
    return { category: cat, label: CATEGORY_LABELS[cat], insight };
  });

  return { overallAssessment, topConcerns, recommendations, categoryInsights };
}
