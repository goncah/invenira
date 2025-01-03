import { useSearchParams } from 'react-router-dom';

export default function ViewIAP() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  return (
    <div>
      <h2>View IAP</h2>
      <p>IAP ID: {id}</p>
    </div>
  );
}
