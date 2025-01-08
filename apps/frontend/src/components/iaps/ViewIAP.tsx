import Typography from '@mui/material/Typography';
import React, { useMemo, useState } from 'react';
import { CircularProgress, Divider, Grid2, Popover } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { IAPsService } from '../../services/iaps.service';
import { ActivitiesService } from '../../services/activities.service';
import { FilterableTable } from '@invenira/components';
import { ActivityKey } from '@invenira/model';
import Button from '@mui/material/Button';
import { router } from '../../App';
import { useSearch } from '@tanstack/react-router';

const columns = [
  {
    id: 'name' as ActivityKey,
    name: 'Name',
  },
];

export default function ViewIAP() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [url, setUrl] = useState('');
  const search = useSearch({ from: '/view-iap' });
  const [iapId] = useState<string>(search?.id || '');
  const auth = useAuth();

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const activityService = useMemo(() => {
    return new ActivitiesService();
  }, []);

  const token = () => {
    return auth?.user?.access_token || '';
  };

  const {
    data: iap,
    isLoading: isIapLoading,
    error: iapError,
  } = useQuery({
    queryKey: ['iap', iapId],
    queryFn: async () => {
      const iap = await iapService.getOne(iapId, token());

      if (!iap) {
        throw new Error('Invalid IAP id');
      }

      if (!iap.isDeployed) {
        router.navigate({ to: '/edit-iap', search: { id: iapId } });
      }

      return iap;
    },
  });

  if (iapError) {
    throw iapError;
  }

  const {
    data: activityList,
    isLoading: isActivitiesLoading,
    error: atError,
  } = useQuery({
    queryKey: ['activities', iapId],
    queryFn: async () => {
      const _iap = await iapService.getOne(iapId, token());
      return activityService.getAll(token()).then((data) =>
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
  });

  if (atError) {
    throw atError;
  }

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
