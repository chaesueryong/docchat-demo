# Security and Data Policy

## Data retention

Application logs are retained for 7 days on the Free plan, 30 days on Pro, and up to 365 days on Enterprise. Deleted projects are soft-deleted for 14 days, during which they can be restored from the dashboard; after 14 days all project data, deployments, and logs are permanently erased.

Database backups (for managed Postgres) are taken daily and retained for 7 days on Pro and 35 days on Enterprise. Point-in-time recovery is available on Enterprise only.

## Data location

By default, data is stored in the US East region. Pro and Enterprise customers can choose the EU (Frankfurt) or Asia Pacific (Seoul) region per project at creation time. Data never leaves the selected region.

## Compliance

Northwind Cloud is SOC 2 Type II certified and GDPR compliant. A signed DPA is available for all paid plans under Settings → Compliance. Enterprise customers can request our latest penetration test summary under NDA.

## Access and authentication

All dashboard access requires two-factor authentication for organizations with more than 5 members. API keys are scoped per project and can be restricted to read-only. Enterprise SSO supports Okta, Azure AD, and Google Workspace via SAML 2.0.

## Reporting vulnerabilities

Report security issues to security@northwind.cloud. We run a responsible disclosure program and respond within 48 hours. Please do not test against other customers' projects.
