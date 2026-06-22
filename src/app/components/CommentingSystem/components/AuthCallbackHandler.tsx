import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Spinner,
} from '@patternfly/react-core';
import { clearReturnUrl, clearVerifier, retrieveReturnUrl, retrieveVerifier } from '../services/pkce';
import { storeGitLabAuth } from '../contexts/GitLabAuthContext';

function getGitLabBaseUrl(): string {
  const url = process.env.VITE_GITLAB_BASE_URL || 'https://gitlab.cee.redhat.com';
  return url.replace(/\/+$/, '');
}

function getClientId(): string {
  return process.env.VITE_GITLAB_CLIENT_ID || '';
}

function getRedirectUri(): string {
  return `${window.location.origin}${process.env.PUBLIC_PATH || ''}/auth/gitlab/callback`;
}

async function exchangeToken(
  code: string,
  verifier: string,
): Promise<{ access_token: string }> {
  const baseUrl = getGitLabBaseUrl();
  const isDev = window.location.hostname === 'localhost';

  const body = {
    client_id: getClientId(),
    code,
    grant_type: 'authorization_code',
    redirect_uri: getRedirectUri(),
    code_verifier: verifier,
  };

  let resp: Response;
  if (isDev) {
    resp = await fetch('/api/gitlab-oauth-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } else {
    resp = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }

  return resp.json();
}

async function fetchUserInfo(
  token: string,
): Promise<{ username: string; avatar_url: string }> {
  const baseUrl = getGitLabBaseUrl();
  const isDev = window.location.hostname === 'localhost';

  let resp: Response;
  if (isDev) {
    resp = await fetch('/api/gitlab-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, method: 'GET', endpoint: '/user' }),
    });
  } else {
    resp = await fetch(`${baseUrl}/api/v4/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (!resp.ok) {
    throw new Error(`Failed to fetch user info (${resp.status})`);
  }

  return resp.json();
}

const AuthCallbackHandler: React.FunctionComponent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const exchangeAttempted = React.useRef(false);

  React.useEffect(() => {
    if (exchangeAttempted.current) return;
    exchangeAttempted.current = true;

    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code received from GitLab.');
      return;
    }

    const verifier = retrieveVerifier();
    if (!verifier) {
      setError('PKCE verifier not found. Please try signing in again.');
      return;
    }

    (async () => {
      try {
        const tokenData = await exchangeToken(code, verifier);
        const userInfo = await fetchUserInfo(tokenData.access_token);

        storeGitLabAuth(tokenData.access_token, {
          login: userInfo.username,
          avatar: userInfo.avatar_url,
        });

        const returnUrl = retrieveReturnUrl() || '/';

        // Clean up PKCE state only after successful exchange
        clearVerifier();
        clearReturnUrl();

        navigate(returnUrl, { replace: true });

        // Notify the auth context in this tab (storage events don't fire in the same tab for real localStorage changes)
        const userForStorage = JSON.stringify({
          login: userInfo.username,
          avatar: userInfo.avatar_url,
        });
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'gitlab_oauth_token',
            newValue: tokenData.access_token,
          }),
        );
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'gitlab_oauth_user',
            newValue: userForStorage,
          }),
        );
      } catch (e: any) {
        setError(e?.message || 'Authentication failed.');
      }
    })();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <Bullseye>
        <EmptyState titleText="Authentication Error" variant="sm" id="auth-callback-error">
          <EmptyStateBody>{error}</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <Bullseye>
      <EmptyState titleText="Signing in..." variant="sm" id="auth-callback-loading">
        <EmptyStateBody>
          <Spinner size="lg" id="auth-callback-spinner" />
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};

export default AuthCallbackHandler;
