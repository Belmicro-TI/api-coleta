const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const sankhyaRoutes = require('./routes/sankhya.routes');
const authRoutes = require('./routes/auth.routes');
const printRoutes = require('./routes/print.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:8081'];

const allowedPatterns = [/^https:\/\/[^.]+\.apps\.zdusercontent\.com$/];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (allowedPatterns.some((re) => re.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error(`Origem não permitida: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: '5mb' }));

app.use('/sankhya', sankhyaRoutes);
app.use('/auth', authRoutes);
app.use('/print', printRoutes);
app.use('/health', healthRoutes);

// Middleware de erro centralizado
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  } else {
    console.error(`[erro] ${status} - ${message}`);
  }

  res.status(status).json({ success: false, error: message });
});

module.exports = app;
