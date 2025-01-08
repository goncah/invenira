import { useAuth } from 'react-oidc-context';
import { router } from '../App';

export default function Logout() {
  const auth = useAuth();

  auth.removeUser().then(() => router.navigate({ to: '/' }));

  return <div></div>;
}
