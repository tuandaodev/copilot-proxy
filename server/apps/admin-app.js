import { App } from '@tinyhttp/app';
import {
  addToken,
  createToken,
  getTokens,
  removeToken,
  setDefaultToken,
  updateTokenName,
} from '../controllers/token-controller.js';

const app = new App();

app
  .post('/token', createToken) // TODO: rename
  .post('/tokens', addToken)
  .put('/tokens/default', setDefaultToken)
  .patch('/tokens/:id', updateTokenName)
  .get('/tokens', getTokens)
  .delete('/tokens/:id', removeToken);

export { app as adminApp };
