/**
 * Production-ready default YAML fragments for the deploy modal: **spec** only
 * (merged into the full MCPServer by the deployment flow). Inline comments inside
 * the spec document env and options per RHOAIENG-54413.
 */

/** Default YAML by catalog server slug. Empty string = no template for that server. */
export const mcpDefaultYamlBySlug: Record<string, string> = {
  'dynatrace-mcp-server': `spec:
  runtime:
    security:
      serviceAccountName: "mcp-dynatrace-sa"
  config:
    port: 3000
    path: "/mcp"
    arguments:
      - "--http"
      - "--port"
      - "3000"
    env:
      # Required: URL to your Dynatrace Platform
      - name: DT_ENVIRONMENT
        value: "https://<ENVIRONMENT_ID>.apps.dynatrace.com"

      # Secure Token Reference (per RHOAIENG-54413)
      - name: DT_PLATFORM_TOKEN
        valueFrom:
          secretKeyRef:
            name: dynatrace-auth
            key: api-token

      # Optional: Budget limit in GB for Grail query scans (Default: 1000)
      # - name: DT_GRAIL_QUERY_BUDGET_GB
      #   value: "1000"
`,

  'mcp-kubernetes-server': `spec:
  runtime:
    security:
      serviceAccountName: "mcp-kubernetes-sa"
  config:
    port: 3000
    path: "/mcp"
    arguments:
      - "--http"
      - "--port"
      - "3000"
`,

  'servicenow-mcp-server': `spec:
  runtime:
    security:
      serviceAccountName: "mcp-servicenow-sa"
  config:
    port: 3000
    path: "/mcp"
    arguments: []
    env:
      - name: SERVICENOW_INSTANCE_URL
        valueFrom:
          secretKeyRef:
            name: servicenow-auth
            key: instance-url
      - name: SERVICENOW_USERNAME
        valueFrom:
          secretKeyRef:
            name: servicenow-auth
            key: username
      - name: SERVICENOW_PASSWORD
        valueFrom:
          secretKeyRef:
            name: servicenow-auth
            key: password
`,

  'github-mcp-server': `spec:
  runtime:
    security:
      serviceAccountName: "mcp-github-sa"
  config:
    port: 3000
    path: "/mcp"
    arguments:
      - "--http"
      - "--port"
      - "3000"
    env:
      - name: GITHUB_PERSONAL_ACCESS_TOKEN
        valueFrom:
          secretKeyRef:
            name: github-mcp-auth
            key: token
`,

  'postgres-mcp-server': `spec:
  runtime:
    security:
      serviceAccountName: "mcp-postgres-sa"
  config:
    port: 3000
    path: "/mcp"
    arguments:
      - "--http"
      - "--port"
      - "3000"
    env:
      - name: DATABASE_URL
        valueFrom:
          secretKeyRef:
            name: postgres-mcp-auth
            key: connection-url
`,

  'salesforce-mcp-server': `spec:
  runtime:
    security:
      serviceAccountName: "mcp-salesforce-sa"
  config:
    port: 3000
    path: "/mcp"
    arguments: []
    env:
      - name: SALESFORCE_INSTANCE_URL
        valueFrom:
          secretKeyRef:
            name: salesforce-mcp-auth
            key: instance-url
      - name: SALESFORCE_USERNAME
        valueFrom:
          secretKeyRef:
            name: salesforce-mcp-auth
            key: username
      - name: SALESFORCE_PASSWORD
        valueFrom:
          secretKeyRef:
            name: salesforce-mcp-auth
            key: password
`,
};

/**
 * Returns the production-ready default **spec** YAML for the deployment modal.
 * Empty string when the catalog has no template.
 */
export function getDefaultYamlFromCatalog(serverSlug: string | undefined): string {
  if (!serverSlug) return '';
  return mcpDefaultYamlBySlug[serverSlug]?.trim() ?? '';
}
