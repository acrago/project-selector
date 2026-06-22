/* eslint-disable @typescript-eslint/no-var-requires */

// Load .env file for local configuration
require('dotenv').config();

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { stylePaths } = require('./stylePaths');
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '9001';

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: {
    host: HOST,
    port: PORT,
    /** Avoid stale bundles/HTML when iterating on UI (browser + static dist fallback). */
    headers: { 'Cache-Control': 'no-store' },
    historyApiFallback: true,
    open: true,
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: (error) => {
          // Suppress ResizeObserver loop errors - these are harmless
          const errorMessage = error?.message || error?.toString() || '';
          if (
            errorMessage.includes('ResizeObserver loop') ||
            errorMessage.includes('ResizeObserver loop completed with undelivered notifications')
          ) {
            return false;
          }
          return true;
        },
      },
    },
    setupMiddlewares: (middlewares, devServer) => {
      const gitlabBaseUrl = process.env.VITE_GITLAB_BASE_URL || 'https://gitlab.cee.redhat.com';

      // GitLab API proxy (avoids CORS for local development)
      devServer.app.post('/api/gitlab-proxy', require('express').json(), async (req, res) => {
        const { token, method, endpoint, data } = req.body;
        try {
          const fetchOpts = {
            method: method || 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          };
          if (data && method !== 'GET') {
            fetchOpts.body = JSON.stringify(data);
          }
          const resp = await fetch(`${gitlabBaseUrl}/api/v4${endpoint}`, fetchOpts);
          const contentType = resp.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const json = await resp.json();
            res.status(resp.status).json(json);
          } else {
            const text = await resp.text();
            res.status(resp.status).send(text);
          }
        } catch (err) {
          res.status(500).json({ error: err.message || 'Proxy error' });
        }
      });

      // GitLab OAuth token exchange proxy
      devServer.app.post('/api/gitlab-oauth-token', require('express').json(), async (req, res) => {
        try {
          const resp = await fetch(`${gitlabBaseUrl}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
          });
          const json = await resp.json();
          res.status(resp.status).json(json);
        } catch (err) {
          res.status(500).json({ error: err.message || 'Token exchange error' });
        }
      });

      // Discussions summarization (MaaS) proxy – optional: set MAAS_API_KEY and MAAS_ENDPOINT_URL in .env
      devServer.app.post('/api/discussions-summarize', require('express').json(), async (req, res) => {
        const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt : '';
        if (!prompt.trim()) {
          res.status(400).json({ error: 'Missing or empty prompt' });
          return;
        }
        const apiKey = process.env.MAAS_API_KEY;
        const baseUrl = process.env.MAAS_ENDPOINT_URL || 'https://llama-3-2-3b-maas-apicast-production.apps.prod.rhoai.rh-aiservices-bu.com';
        const path = '/v1/chat/completions';
        const endpointUrl = baseUrl.replace(/\/+$/, '') + path;
        if (!apiKey) {
          res.status(200).json({
            summary:
              'Summarization is not configured. Set MAAS_API_KEY (and optionally MAAS_ENDPOINT_URL) in .env to enable AI summaries.',
          });
          return;
        }
        try {
          const body = JSON.stringify({
            model: 'llama-3-2-3b',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 400,
            temperature: 0.3,
          });
          const resp = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body,
          });
          const data = await resp.json().catch(() => ({}));
          const summary =
            data.choices?.[0]?.message?.content ??
            data.choices?.[0]?.text ??
            data.output?.[0] ??
            '';
          if (resp.ok) {
            res.status(200).json({ summary: String(summary).trim() });
          } else {
            res.status(resp.status).json({
              error: data.error?.message || resp.statusText || 'MaaS request failed',
            });
          }
        } catch (err) {
          res.status(500).json({ error: err.message || 'Summarization proxy error' });
        }
      });

      return middlewares;
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [...stylePaths],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
