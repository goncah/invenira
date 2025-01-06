import { useNavigate, useSearchParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import React, { useMemo, useState } from 'react';
import { CircularProgress, Divider, Grid2, Popover } from '@mui/material';
import { useQuery } from 'react-query';
import { useAuth } from 'react-oidc-context';
import { IAPsService } from '../../services/iaps.service';
import { useError } from '../layout/Layout';
import { ActivitiesService } from '../../services/activities.service';
import { FilterableTable } from '@invenira/components';
import { ActivityKey } from '@invenira/model';
import Button from '@mui/material/Button';

const columns = [
  {
    id: 'name' as ActivityKey,
    name: 'Name',
  },
];

export default function ViewIAP() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const { showError } = useError();

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const activityService = useMemo(() => {
    return new ActivitiesService();
  }, []);

  const { data: iap, isLoading: isIapLoading } = useQuery(
    ['iap', searchParams.get('id')],
    async () => {
      const token = auth?.user?.access_token || '';
      const id = searchParams.get('id') || '';
      return iapService.getOne(id, token);
    },
    {
      onSuccess: (data) => {
        if (!data.isDeployed) {
          navigate(`/edit-iap?id=${searchParams.get('id')}`);
        }
      },
      onError: () => {
        showError('Failed to load IAP.');
      },
    },
  );

  const { data: activityList, isLoading: isActivitiesLoading } = useQuery(
    ['activities'],
    async () => {
      const token = auth?.user?.access_token || '';
      const id = searchParams.get('id') || '';
      const _iap = await iapService.getOne(id, token);
      return activityService.getAll(token).then((data) =>
        data
          .filter((a) => _iap.activityIds?.includes(a._id))
          .map((a, idx) => ({
            row: a,
            actions: [
              <Button
                key={`btn-${a._id}-${idx}`}
                variant="outlined"
                color="primary"
                onClick={(e) => {
                  setUrl(
                    // Deserialization issue, TODO JSON.parse does not auto identify a Map
                    // eslint-disable-next-line
                    (_iap.deployUrls as any)[a._id] + '&userId=[LMS USER ID]' ||
                      'Error',
                  );
                  handleClick(e);
                }}
              >
                View URL
              </Button>,
            ],
          })),
      );
    },
    {
      onError: () => {
        showError('Failed to load activities.');
      },
    },
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popId = open ? 'simple-popover' : undefined;

  if (isIapLoading || isActivitiesLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid2>
      <Grid2>
        <Typography
          variant="h5"
          component="div"
          sx={{ mr: 2, textAlign: 'center' }}
        >
          {iap?.name} IAP
        </Typography>
        <Typography component="div" sx={{ mr: 2 }}>
          <p>IAP ID: {iap?._id}</p>
          <p>IAP Description: {iap?.description}</p>
          <p>Deployed: {iap?.isDeployed ? 'Yes' : 'No'}</p>
        </Typography>
        <Divider>Activities:</Divider>
        <FilterableTable
          columns={columns}
          sortBy={'name'}
          rows={activityList || []}
        />

        <Popover
          id={popId}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Typography sx={{ p: 2 }}>{url}</Typography>
        </Popover>
      </Grid2>
      <Grid2>
        <Divider sx={{ mt: 2 }}>Objectives:</Divider>

        <FilterableTable columns={[]} sortBy={'name'} rows={[]} />
      </Grid2>
    </Grid2>
  );
}
