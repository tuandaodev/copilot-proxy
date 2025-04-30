import { App } from '@tinyhttp/app';
import { getTokens, setDefaultToken } from '../controllers/token-controller.js';
import { startLogin, startPolling } from '../token-resource.js';
import * as tokenStorage from '../token-storage.js';

const app = new App();

app
  .use((req, res, next) => {
    // Middleware to handle admin app requests
    console.log('Admin app middleware');
    next();
  })
  .post('/token', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    const jsonWriter = (obj) => {
      res.write(JSON.stringify(obj));
      return obj;
    };
    await startLogin().then(jsonWriter);
    const { accessToken } = await startPolling().then(jsonWriter);
    if (accessToken) {
      tokenStorage.storeToken({
        name: `Token-${Date.now()}`,
        token: accessToken,
      });
    }
    res.end();
  })
  .put('/tokens/default', setDefaultToken)
  .get('/tokens', getTokens)
  .delete('/tokens/:id', async (req, res) => {
    const { id } = req.params;
    await tokenStorage.removeToken(id);
    res.status(204).end();
  });

export { app as adminApp };
