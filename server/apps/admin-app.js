import { App } from '@tinyhttp/app';
import {
  createToken,
  getTokens,
  removeToken,
  setDefaultToken,
  updateTokenName,
} from '../controllers/token-controller.js';

const app = new App();

app
  .use((req, res, next) => {
    // Middleware to handle admin app requests
    console.log('Admin app middleware');
    next();
  })
  .post('/token', createToken)
  .put('/tokens/default', setDefaultToken)
  .patch('/tokens/:id', updateTokenName)
  .get('/tokens', getTokens)
  .delete('/tokens/:id', removeToken);

export { app as adminApp };
