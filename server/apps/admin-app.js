import { App } from '@tinyhttp/app';
import { startLogin, startPolling } from '../token-resource.js';
import { getTokens, removeToken, storeToken } from '../token-storage.js';

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
      storeToken({
        name: `Token-${Date.now()}`,
        token: accessToken,
      });
    }
    res.end();
  })
  .get('/tokens', async (req, res) => {
    const tokens = await getTokens();
    res.json(tokens);
  })
  .delete('/tokens/:id', async (req, res) => {
    const { id } = req.params;
    await removeToken(id);
    res.status(204).end();
  });

export { app as adminApp };
