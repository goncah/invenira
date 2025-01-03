import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();
  const auth = useAuth();

  auth.removeUser().then(() => navigate('/'));

  return <div></div>;
}
