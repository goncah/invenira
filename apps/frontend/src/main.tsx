import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createRoot } from 'react-dom/client';
import App from './App';
import { StrictMode } from 'react';
import { AuthProvider } from 'react-oidc-context';
import {
  authority,
  clientId,
  clientSecret,
  redirectUri,
  redirectUriLogout,
} from './constants';

const oAuthConfig = {
  authority: authority,
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: redirectUriLogout,
  response_type: 'code',
  scope: 'email openid phone profile roles',
};

const root = createRoot(
  document.getElementById('root') as unknown as HTMLElement,
);

root.render(
  <StrictMode>
    <AuthProvider {...oAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
);
