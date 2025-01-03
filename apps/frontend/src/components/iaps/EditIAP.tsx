import { useNavigate, useSearchParams } from 'react-router-dom';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { IAPsService } from '../../services/iaps.service';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IAPActivitiesTable from './IAPActivitiesTable';
import { useAuth } from 'react-oidc-context';
import { Iap } from '@invenira/model';

export default function EditIAP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const [iap, setIap] = useState<Iap | null>(null);
  const [error, setError] = React.useState({ open: false, message: '' });

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  useEffect(() => {
    const token = auth?.user?.access_token;
    const _id = searchParams.get('id');
    iapService
      .getOne(_id!, token!)
      .then((data) => {
        if (data.isDeployed) {
          navigate(`/view-iap?id=${_id}`);
        } else {
          setIap(data as unknown as Iap);
        }
      })
      .catch(() => handleError('Failed to load IAP.'));
  }, [auth?.user?.access_token, iapService, navigate, searchParams]);

  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  return (
    <>
      <h2>Edit {iap?.name} IAP</h2>
      <p>IAP ID: {iap?._id}</p>
      <p>IAP Description: {iap?.description}</p>
      <p>Deployed: {iap?.isDeployed ? 'Yes' : 'No'}</p>

      <IAPActivitiesTable iapId={iap?._id} activityIds={iap?.activityIds} />

      <Snackbar
        open={error.open}
        autoHideDuration={6000}
        onClose={handleErrorClose}
      >
        <Alert
          onClose={handleErrorClose}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error.message}
        </Alert>
      </Snackbar>
    </>
  );
}
