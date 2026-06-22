# Discussions Summarize Worker (MaaS proxy)

This [Cloudflare Worker](https://workers.cloudflare.com/) exposes an HTTP endpoint that the prototype calls in **production** for the Discussions “Summarize” feature. It forwards requests to MaaS so the API key never lives in the frontend or repo.

**Don’t have Cloudflare?** You don’t have to use it. The app only needs *some* HTTPS URL that accepts the same API (see [API](#api) below) and allows CORS from your GitLab Pages origin. You can run a small backend on a server you already have (Node, Python, OpenShift, etc.), or use another serverless provider. Set `SUMMARIZE_API_URL` to that URL when building. This folder is just one ready-made option.

## Deploy

1. **Install Wrangler** (one time): `npm i -g wrangler` or use `npx wrangler`.
2. **Log in**: `npx wrangler login` (opens browser).
3. **From this folder**: `npx wrangler deploy`.
4. **First-time only** — If Wrangler says you need to register a workers.dev subdomain:
   - **"Would you like to register a workers.dev subdomain now?"** → answer **Y**.
   - **"What would you like your workers.dev subdomain to be?"** → enter **only the subdomain** (e.g. `rhoai`), not the full URL. The worker name is already set in this project, so your worker will be at `https://rhoai-discussions-summarize.<subdomain>.workers.dev`.
5. **Set the MaaS API key** (required):  
   `npx wrangler secret put MAAS_API_KEY`  
   Paste your key when prompted.
6. **(Optional)** Different MaaS endpoint:  
   `npx wrangler secret put MAAS_ENDPOINT_URL`  
   and enter the full base URL (e.g. `https://your-maas.example.com`). If unset, the worker uses the default Llama 3.2 3B endpoint.

After deploy, Wrangler prints the worker URL (e.g. `https://rhoai-discussions-summarize.rhoai.workers.dev`). Use that **exact** URL as the summarization API URL (the app sends `POST` to it with body `{ "prompt": "..." }`).

## Use in production build

When building the prototype for production (e.g. in GitLab CI), set:

```bash
SUMMARIZE_API_URL=https://rhoai-discussions-summarize.<your-subdomain>.workers.dev
```

- **GitLab CI**: In your project, go to **Settings → CI/CD → Variables**, add variable **Key** `SUMMARIZE_API_URL` and **Value** your worker URL (e.g. `https://rhoai-discussions-summarize.rhoai.workers.dev`). The next pipeline build will inline it so the deployed app calls the worker for Summarize.
- **Local prod build**: `SUMMARIZE_API_URL=https://your-worker.workers.dev npm run build`.

The worker handles CORS so the browser can call it from your GitLab Pages origin.

## API

- **POST** (body `application/json`): `{ "prompt": "string" }`  
  Returns: `{ "summary": "string" }` or `{ "error": "string" }`.
