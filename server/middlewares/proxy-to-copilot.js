import { Writable } from 'node:stream';

import { COPILOT_API_HOST, COPILOT_HEADERS } from '../config.js';

export const proxyToCopilot = async (req, res) => {
  try {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);

    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        ...COPILOT_HEADERS,
        authorization: `Bearer ${req.bearerToken}`,
        host: COPILOT_API_HOST,
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      duplex: 'half',
    };

    const targetUrl = `https://${COPILOT_API_HOST}${parsedUrl.pathname}${parsedUrl.search}`;
    console.log(`Proxying to: ${targetUrl}`);

    const response = await fetch(targetUrl, options);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      response.body.pipeTo(Writable.toWeb(res));
    } else {
      const data = await response.text();
      res.send(data);
    }
  } catch (error) {
    console.error(`Proxy error: ${error.message}`);
    res.status(500).send(`Proxy error: ${error.message}`);
  }
};
