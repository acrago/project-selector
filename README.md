# OpenShift AI UXD Prototype

This repository contains a **design prototype** of OpenShift AI, created primarily by the User Experience Design (UXD) team. It is intended for **sharing, discussion, and design exploration purposes only**.

> **Important:** This is not production-ready code. It is a vibe-designed artifact built to support design work, facilitate stakeholder conversations, and explore UI/UX concepts for OpenShift AI.

## 3.5 Prototype Link

> [!TIP]
> Updates to this prototype will be located at this URL a few minutes after merging:
> https://rhoai-3-5-713a29.pages.redhat.com

## Purpose

- **Design exploration**: Rapidly prototype and iterate on UI concepts
- **Stakeholder communication**: Share interactive designs with product, engineering, and other stakeholders
- **User research**: Conduct usability testing and gather feedback on proposed designs
- **Discussion artifact**: Provide a tangible reference point for design discussions

## Quick Start

**New to this project?** Check out the [Cursor Setup Guide](https://docs.google.com/document/d/1bz_lJ_OYchfKAuS0I7xcvgvSVzPm16CjQyb_7JB0_F8/edit?tab=t.rutfmkrs4883) first for the recommended development environment setup.

```bash
# Clone the repository
git clone <repository-url>
cd rhoai

# Install dependencies and start the development server
npm install && npm run start:dev
```

The prototype will be available at `http://localhost:9001`.

## Prototype Appearance Configuration

The prototype supports configurable appearance settings to prepare it for different contexts (e.g., user research, demos). Adjust the `.env` file in the root directory with the following options:

```sh
# Use generic "AI Platform" text instead of branded logo
GENERIC_LOGO=true

# Hide the orange "UXD PROTOTYPE" banner
PROTOTYPE_BAR=false

# Set default fidelity mode
DEFAULT_FIDELITY=low
```

### Available Options

**GENERIC_LOGO**
- `true`: Shows "AI Platform" as text (generic, unbranded)
- `false` (default): Shows the branded product logo

**PROTOTYPE_BAR**
- `true` (default): Shows the orange "UXD PROTOTYPE" banner with fidelity controls
- `false`: Hides the banner completely

**DEFAULT_FIDELITY**
- `high` (default): Starts with high fidelity mode
- `low`: Starts with low fidelity mode
- Note: URL query parameter `?fidelity=low` or `?fidelity=high` will override this setting

**GITLAB_TOKEN**
- Optional: GitLab Personal Access Token for fetching fork information
- Used to populate the "Switch" dropdown in the prototype bar with other prototype deployments
- Create a token at: https://gitlab.cee.redhat.com/-/user_settings/personal_access_tokens (needs `read_api` scope)
- If not set, the prototype bar will use a static list of known forks

**MAAS_API_KEY** and **MAAS_ENDPOINT_URL** (optional, for local dev)
- Used by the **Discussions** tab “Summarize” feature. **Locally**, the webpack dev server proxies requests to MaaS when you set `MAAS_API_KEY` (and optionally `MAAS_ENDPOINT_URL`) in `.env`.
- If not set locally, the Summarize button still works and shows a message that summarization is not configured.

**Discussions summarization in production**
- The static site (e.g. GitLab Pages) has no server, so Summarize needs an external endpoint. This repo includes a **Cloudflare Worker** in the `worker/` folder that proxies to MaaS.
- **Steps:** Deploy the worker (see `worker/README.md`), set the worker’s `MAAS_API_KEY` secret, then set **`SUMMARIZE_API_URL`** when building the prototype so the frontend calls your worker URL.
- **GitLab CI:** Add a CI/CD variable `SUMMARIZE_API_URL` = your worker URL (e.g. `https://rhoai-discussions-summarize.<subdomain>.workers.dev`). The build inlines it so the deployed app uses that URL for Summarize.
- **Optional:** You can use another backend (e.g. your own API) as long as it accepts `POST` with `{ "prompt": "string" }` and returns `{ "summary": "string" }` and allows CORS from your Pages origin.

### Common Configuration Scenarios

- **User research**: Set `GENERIC_LOGO=true`, `PROTOTYPE_BAR=false`, and optionally `DEFAULT_FIDELITY=low`
- **Internal demos**: Keep defaults or customize as needed
- **Stakeholder reviews**: Use defaults with the prototype banner visible

## Fork Switcher

The prototype bar includes a "Switch" dropdown that allows you to quickly navigate between different prototype deployments (forks with GitLab Pages).

### How it Works

1. **Static List (Default)**: Without a GitLab token, the prototype uses a static list of known forks defined in `src/hooks/useGitLabForks.ts`
2. **Dynamic Fetching**: With a `GITLAB_TOKEN` configured, the prototype fetches the fork list from GitLab API at runtime

### Updating the Static Fork List

To update the list of known forks with their Pages URLs:

```bash
# Set your GitLab token and run the fetch script
GITLAB_TOKEN=your_token node scripts/fetch-gitlab-forks.js
```

The script will output the fork data in a format you can copy into `src/hooks/useGitLabForks.ts`.

### Adding Your Fork

If you've forked this repository and deployed GitLab Pages:

1. Run the fetch script above to discover your fork automatically, or
2. Manually add your fork to the `STATIC_FORKS` array in `src/hooks/useGitLabForks.ts`

## Technology Stack

This prototype is built with:
- [PatternFly](https://www.patternfly.org/) - Red Hat's open source design system
- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Webpack](https://webpack.js.org/) - Build tooling

## Design Documentation

Design specifications and related documentation can be found in the `.design/` directory.

## Contributing

When contributing to this prototype:
- Focus on design fidelity and user experience over code quality
- Use PatternFly components and patterns where possible
- Document any new features or design concepts in the `.design/` directory

