import express from 'express';
import cors from 'cors';
import risksRouter from './routes/risks.js';
import membersRouter from './routes/members.js';
import agentRouter from './routes/agent.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { apiKeyAuth } from './middleware/api-key.js';
import { runMigrations, closeDb } from './db/connection.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ── Middleware Stack ────────────────────────────────
app.use(requestLogger);

// Optional API-key auth (pass-through when env not set)
app.use(apiKeyAuth);

app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/risks', risksRouter);
app.use('/api/members', membersRouter);
app.use('/api/agent', agentRouter);

// ── Global Error Handler (must be last) ───────────
app.use(errorHandler);

// ── Startup ────────────────────────────────────────
runMigrations();

const server = app.listen(PORT, () => {
  console.log(`🏠 家庭风险管理操作系统 Agent 已启动`);
  console.log(`   API 服务: http://localhost:${PORT}`);
  console.log(`   数据库: data/family-os.db`);
});

// ── Graceful Shutdown ──────────────────────────────
function shutdown(signal: string) {
  console.log(`\n   收到 ${signal}，正在关闭服务...`);
  server.close(() => {
    closeDb();
    console.log('   服务已关闭');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
