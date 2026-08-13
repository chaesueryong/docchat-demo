# Getting Started with Northwind Cloud

Northwind Cloud is a developer platform for deploying and scaling web applications without managing infrastructure. This guide walks you through creating your first project.

## Creating an account

Sign up at northwind.cloud with your email or GitHub account. Every new account starts on the Free plan with no credit card required. You can invite up to 2 teammates on the Free plan.

## Your first deployment

Install the CLI with `npm install -g northwind-cli`, then run `nw login` and `nw deploy` from your project root. The CLI detects your framework automatically (Next.js, Remix, SvelteKit, Express, and static sites are supported) and provisions a deployment in about 40 seconds.

Every deployment gets a unique preview URL. Pushing to your main branch triggers a production deployment automatically once you connect your GitHub repository in the dashboard under Settings → Git.

## API keys

API keys are managed in the dashboard under Settings → API Keys. Each key is shown only once at creation time — store it securely. To reset a key, revoke the old key first, then create a new one. Revoked keys stop working within 60 seconds. There is no way to view an existing key again after creation; resetting is the only option if a key is lost.

## Environments

Every project has three environments: development, preview, and production. Environment variables are scoped per environment and can be set in the dashboard or via `nw env set KEY=value --env production`. Changes to production environment variables require a redeploy to take effect.
