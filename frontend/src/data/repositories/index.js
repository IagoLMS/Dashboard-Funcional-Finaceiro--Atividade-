import { cashFlowMockRepo }    from './mock/cashflow.mock.js';
import { receivablesMockRepo } from './mock/receivables.mock.js';
import { payablesMockRepo }    from './mock/payables.mock.js';
import { costCentersMockRepo } from './mock/costCenters.mock.js';
import { dashboardMockRepo }   from './mock/dashboard.mock.js';

import { cashFlowApiRepo }    from './api/cashflow.api.js';
import { receivablesApiRepo } from './api/receivables.api.js';
import { payablesApiRepo }    from './api/payables.api.js';
import { costCentersApiRepo } from './api/costCenters.api.js';
import { dashboardApiRepo }   from './api/dashboard.api.js';

const REPOS = {
  mock: {
    cashflow:    cashFlowMockRepo,
    receivables: receivablesMockRepo,
    payables:    payablesMockRepo,
    costCenters: costCentersMockRepo,
    dashboard:   dashboardMockRepo,
  },
  api: {
    cashflow:    cashFlowApiRepo,
    receivables: receivablesApiRepo,
    payables:    payablesApiRepo,
    costCenters: costCentersApiRepo,
    dashboard:   dashboardApiRepo,
  },
};

/**
 * Returns the repository for the given entity and data source mode.
 * @param {'cashflow'|'receivables'|'payables'|'costCenters'|'dashboard'} entity
 * @param {'mock'|'api'} mode
 */
export function getRepository(entity, mode) {
  const byMode = REPOS[mode] || REPOS.mock;
  return byMode[entity] || null;
}
