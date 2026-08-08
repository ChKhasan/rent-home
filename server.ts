import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const configuredHosts = (process.env['NG_ALLOWED_HOSTS'] ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);
  const commonEngine = new CommonEngine({
    allowedHosts: configuredHosts.length
      ? configuredHosts
      : ['localhost', '127.0.0.1', 'nexthome.uz', 'www.nexthome.uz'],
  });

  server.set('trust proxy', 1);
  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.get('/health/live', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  server.get('/assets/runtime-config.js', (_req, res) => {
    const config = JSON.stringify({
      primeUiLicenseKey: process.env['NEXTHOME_PRIMEUI_LICENSE_KEY'] ?? '',
      yandexMapsApiKey: process.env['NEXTHOME_YANDEX_MAPS_API_KEY'] ?? '',
    }).replace(/</g, '\\u003c');

    res
      .type('application/javascript')
      .set('Cache-Control', 'no-store')
      .send(`window.__NEXTHOME_RUNTIME_CONFIG__ = ${config};`);
  });

  // Serve static files from /browser
  server.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
    }),
  );

  // All regular routes use the Angular engine
  server.get('/{*splat}', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
