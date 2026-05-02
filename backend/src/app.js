import express  from 'express';
import cors     from 'cors';
import morgan   from 'morgan';

import { FRONTEND_URL }   from './config/env.js';
import { errorHandler }   from './middleware/errorHandler.js';

import payablesRoutes    from './routes/payables.routes.js';
import receivablesRoutes from './routes/receivables.routes.js';
import cashflowRoutes    from './routes/cashflow.routes.js';
import costCentersRoutes from './routes/costCenters.routes.js';
import dashboardRoutes   from './routes/dashboard.routes.js';

const app = express();

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/payables',     payablesRoutes);
app.use('/api/receivables',  receivablesRoutes);
app.use('/api/cashflow',     cashflowRoutes);
app.use('/api/cost-centers', costCentersRoutes);
app.use('/api/dashboard',    dashboardRoutes);

app.use(errorHandler);

export default app;
