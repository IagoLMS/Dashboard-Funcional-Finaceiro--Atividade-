import 'dotenv/config';
import app from './app.js';
import { PORT } from './config/env.js';

app.listen(PORT, () => {
  console.log(`[server] Backend running on http://localhost:${PORT}`);
  console.log(`[server] Health: http://localhost:${PORT}/api/health`);
});
