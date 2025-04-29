import { App } from '@tinyhttp/app';
import { startLogin, startPolling } from '../token-resource.js';

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
    await startPolling().then(jsonWriter);
    res.end();
  })
  .get('/tokens', (req, res) => {
    res.send('Welcome to the Admin App!');
  });

export { app as adminApp };
