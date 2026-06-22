import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Icon,
  Label,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  Tooltip,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { APIKey, APIKeyStatus } from '../types';
import { useVariantFlags } from '@app/utils/VariantFlagsContext';

interface APIKeyDetailsTabProps {
  apiKey: APIKey;
}

type CodeLanguage = 'curl' | 'python' | 'javascript' | 'java' | 'go';

const APIKeyDetailsTab: React.FunctionComponent<APIKeyDetailsTabProps> = ({ apiKey }) => {
  const navigate = useNavigate();
  const { isVariantFlagEnabled } = useVariantFlags();
  const showSubscriptions = isVariantFlagEnabled('apiKeys', 'showSubscriptions');
  const [activeLanguageTab, setActiveLanguageTab] = React.useState<CodeLanguage>('curl');
  const [copiedStates, setCopiedStates] = React.useState<Record<string, boolean>>({});

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastUsedDate = (date?: Date): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return formatDate(date);
  };

  const getStatusLabel = (status: APIKeyStatus) => {
    const statusMap: Record<APIKeyStatus, { color: 'green' | 'red' | 'grey' | 'orange' | 'purple'; label: string }> = {
      Active: { color: 'green', label: 'Active' },
      Expired: { color: 'red', label: 'Expired' },
      Disabled: { color: 'grey', label: 'Disabled' },
      Inactive: { color: 'orange', label: 'Inactive' },
      AdminRevoked: { color: 'purple', label: 'Admin revoked' },
    };
    const { color, label } = statusMap[status];
    return <Label id={`status-${status.toLowerCase()}`} color={color}>{label}</Label>;
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const subscriptionId = apiKey.subscriptionId || '<subscription-id>';

  const getCodeExamples = (): Record<CodeLanguage, { label: string; code: string }> => {
    const curlSubscriptionHeader = showSubscriptions 
      ? '\n  -H "X-MAAS-SUBSCRIPTION: ' + subscriptionId + '" \\' 
      : '';
    
    const pythonSubscriptionHeader = showSubscriptions
      ? ',\n    "X-MAAS-SUBSCRIPTION": "' + subscriptionId + '"'
      : '';
    
    const jsSubscriptionHeader = showSubscriptions
      ? ",\n    'X-MAAS-SUBSCRIPTION': '" + subscriptionId + "'"
      : '';
    
    const javaSubscriptionHeader = showSubscriptions
      ? '\n    .header("X-MAAS-SUBSCRIPTION", "' + subscriptionId + '")'
      : '';
    
    const goSubscriptionHeader = showSubscriptions
      ? '\n    req.Header.Set("X-MAAS-SUBSCRIPTION", "' + subscriptionId + '")'
      : '';

    return {
      curl: {
        label: 'cURL',
        code: 'curl -X POST https://api.example.com/v1/chat/completions \\\n' +
          '  -H "Content-Type: application/json" \\\n' +
          '  -H "Authorization: Bearer $API_KEY"' + curlSubscriptionHeader + ' \\\n' +
          '  -d \'{\n' +
          '    "model": "gpt-oss-20b",\n' +
          '    "messages": [\n' +
          '      {\n' +
          '        "role": "user",\n' +
          '        "content": "Hello, how are you?"\n' +
          '      }\n' +
          '    ],\n' +
          '    "temperature": 0.7,\n' +
          '    "max_tokens": 150\n' +
          '  }\'',
      },
      python: {
        label: 'Python',
        code: 'import requests\n\n' +
          'url = "https://api.example.com/v1/chat/completions"\n' +
          'headers = {\n' +
          '    "Content-Type": "application/json",\n' +
          '    "Authorization": "Bearer $API_KEY"' + pythonSubscriptionHeader + '\n' +
          '}\n\n' +
          'payload = {\n' +
          '    "model": "gpt-oss-20b",\n' +
          '    "messages": [\n' +
          '        {\n' +
          '            "role": "user",\n' +
          '            "content": "Hello, how are you?"\n' +
          '        }\n' +
          '    ],\n' +
          '    "temperature": 0.7,\n' +
          '    "max_tokens": 150\n' +
          '}\n\n' +
          'response = requests.post(url, headers=headers, json=payload)\n' +
          'print(response.json())',
      },
      javascript: {
        label: 'JavaScript',
        code: "const response = await fetch('https://api.example.com/v1/chat/completions', {\n" +
          "  method: 'POST',\n" +
          '  headers: {\n' +
          "    'Content-Type': 'application/json',\n" +
          "    'Authorization': 'Bearer $API_KEY'" + jsSubscriptionHeader + '\n' +
          '  },\n' +
          '  body: JSON.stringify({\n' +
          "    model: 'gpt-oss-20b',\n" +
          '    messages: [\n' +
          '      {\n' +
          "        role: 'user',\n" +
          "        content: 'Hello, how are you?'\n" +
          '      }\n' +
          '    ],\n' +
          '    temperature: 0.7,\n' +
          '    max_tokens: 150\n' +
          '  })\n' +
          '});\n\n' +
          'const data = await response.json();\n' +
          'console.log(data);',
      },
      java: {
        label: 'Java',
        code: 'import java.net.http.HttpClient;\n' +
          'import java.net.http.HttpRequest;\n' +
          'import java.net.http.HttpResponse;\n' +
          'import java.net.URI;\n\n' +
          'HttpClient client = HttpClient.newHttpClient();\n\n' +
          'String requestBody = """\n' +
          '    {\n' +
          '        "model": "gpt-oss-20b",\n' +
          '        "messages": [\n' +
          '            {\n' +
          '                "role": "user",\n' +
          '                "content": "Hello, how are you?"\n' +
          '            }\n' +
          '        ],\n' +
          '        "temperature": 0.7,\n' +
          '        "max_tokens": 150\n' +
          '    }\n' +
          '    """;\n\n' +
          'HttpRequest request = HttpRequest.newBuilder()\n' +
          '    .uri(URI.create("https://api.example.com/v1/chat/completions"))\n' +
          '    .header("Content-Type", "application/json")\n' +
          '    .header("Authorization", "Bearer $API_KEY")' + javaSubscriptionHeader + '\n' +
          '    .POST(HttpRequest.BodyPublishers.ofString(requestBody))\n' +
          '    .build();\n\n' +
          'HttpResponse<String> response = client.send(request,\n' +
          '    HttpResponse.BodyHandlers.ofString());\n' +
          'System.out.println(response.body());',
      },
      go: {
        label: 'Go',
        code: 'package main\n\n' +
          'import (\n' +
          '    "bytes"\n' +
          '    "encoding/json"\n' +
          '    "fmt"\n' +
          '    "net/http"\n' +
          ')\n\n' +
          'func main() {\n' +
          '    url := "https://api.example.com/v1/chat/completions"\n\n' +
          '    payload := map[string]interface{}{\n' +
          '        "model": "gpt-oss-20b",\n' +
          '        "messages": []map[string]string{\n' +
          '            {\n' +
          '                "role":    "user",\n' +
          '                "content": "Hello, how are you?",\n' +
          '            },\n' +
          '        },\n' +
          '        "temperature": 0.7,\n' +
          '        "max_tokens": 150,\n' +
          '    }\n\n' +
          '    jsonData, _ := json.Marshal(payload)\n\n' +
          '    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))\n' +
          '    req.Header.Set("Content-Type", "application/json")\n' +
          '    req.Header.Set("Authorization", "Bearer $API_KEY")' + goSubscriptionHeader + '\n\n' +
          '    client := &http.Client{}\n' +
          '    resp, err := client.Do(req)\n' +
          '    if err != nil {\n' +
          '        panic(err)\n' +
          '    }\n' +
          '    defer resp.Body.Close()\n\n' +
          '    var result map[string]interface{}\n' +
          '    json.NewDecoder(resp.Body).Decode(&result)\n' +
          '    fmt.Println(result)\n' +
          '}',
      },
    };
  };

  const codeExamples = getCodeExamples();

  const renderHighlightedCode = (code: string, highlights: string[]) => {
    const terms = highlights.filter(Boolean);
    if (terms.length === 0) return code;
    const escaped = terms.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escaped.join('|')})`, 'g');
    const parts = code.split(pattern);
    return parts.map((part, i) =>
      terms.includes(part) ? (
        <span
          key={i}
          style={{
            backgroundColor: '#fdf0d5',
            color: '#795600',
            borderRadius: '3px',
            padding: '1px 4px',
            fontWeight: 600,
          }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <PageSection>
      <Content component={ContentVariants.h2} id="api-key-details-heading" style={{ marginTop: '1rem' }}>
        Details
      </Content>
      <DescriptionList columnModifier={{ default: '2Col' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>Name</DescriptionListTerm>
          <DescriptionListDescription>{apiKey.name}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Description</DescriptionListTerm>
          <DescriptionListDescription>
            {apiKey.description || 'No description provided'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        {showSubscriptions && (
          <DescriptionListGroup>
            <DescriptionListTerm>Subscription</DescriptionListTerm>
            <DescriptionListDescription>
              {apiKey.subscriptionName && apiKey.subscriptionId ? (
                <Button
                  variant="link"
                  isInline
                  id={`subscription-link-${apiKey.id}`}
                  onClick={() => navigate(`/settings/subscriptions/${apiKey.subscriptionId}/details`)}
                >
                  {apiKey.subscriptionName}
                </Button>
              ) : (
                <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                  No subscription
                </span>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        <DescriptionListGroup>
          <DescriptionListTerm>Status</DescriptionListTerm>
          <DescriptionListDescription>
            {getStatusLabel(apiKey.status)}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Owner</DescriptionListTerm>
          <DescriptionListDescription>
            {apiKey.owner.name}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Date created</DescriptionListTerm>
          <DescriptionListDescription>
            {formatDate(apiKey.dateCreated)}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Expiration</DescriptionListTerm>
          <DescriptionListDescription>
            {apiKey.limits?.expirationDate ? (
              formatDate(apiKey.limits.expirationDate)
            ) : (
              <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Tooltip content="This API key has no expiration date. Consider setting an expiration for security purposes.">
                    <Icon status="warning">
                      <ExclamationTriangleIcon />
                    </Icon>
                  </Tooltip>
                </FlexItem>
                <FlexItem>Never</FlexItem>
              </Flex>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Last invoked</DescriptionListTerm>
          <DescriptionListDescription>
            {formatLastUsedDate(apiKey.dateLastUsed)}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <Divider style={{ marginTop: '2rem', marginBottom: '2rem' }} />

      <Content component={ContentVariants.h2} id="usage-example-heading">
        Usage example
      </Content>
      <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '1rem' }}>
        Use this API key to authenticate requests to the chat completions endpoint. Select a language to view the example:
      </div>
      <Tabs
        id="usage-example-language-tabs"
        activeKey={activeLanguageTab}
        onSelect={(_event, tabKey) => setActiveLanguageTab(tabKey as CodeLanguage)}
        aria-label="Code example language tabs"
        style={{ marginBottom: '0' }}
      >
        {(Object.keys(codeExamples) as CodeLanguage[]).map((lang) => (
          <Tab
            key={lang}
            eventKey={lang}
            title={<TabTitleText>{codeExamples[lang].label}</TabTitleText>}
            aria-label={`${codeExamples[lang].label} example`}
          >
            <CodeBlock
              id={`usage-example-code-${lang}`}
              actions={
                <CodeBlockAction>
                  <ClipboardCopyButton
                    id={`copy-button-${lang}`}
                    textId={`code-content-${lang}`}
                    aria-label="Copy to clipboard"
                    onClick={() => handleCopyCode(codeExamples[lang].code, lang)}
                    exitDelay={copiedStates[lang] ? 1500 : 600}
                    variant="plain"
                  >
                    {copiedStates[lang] ? 'Copied!' : 'Copy to clipboard'}
                  </ClipboardCopyButton>
                </CodeBlockAction>
              }
            >
              <CodeBlockCode id={`code-content-${lang}`}>
                {renderHighlightedCode(codeExamples[lang].code, ['$API_KEY', subscriptionId])}
              </CodeBlockCode>
            </CodeBlock>
          </Tab>
        ))}
      </Tabs>
    </PageSection>
  );
};

export { APIKeyDetailsTab };
