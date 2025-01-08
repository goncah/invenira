import * as React from 'react';
import { useMemo, useState } from 'react';
import { IAPsService } from '../../services/iaps.service';
import { useAuth } from 'react-oidc-context';
import { ActivityKey } from '@invenira/model';
import { ActivitiesService } from '../../services/activities.service';
import { FilterableTable } from '@invenira/components';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import {
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid2,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useError } from '../layout/Layout';
import MenuItem from '@mui/material/MenuItem';
import { router } from '../../App';
import { useSearch } from '@tanstack/react-router';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid #000',
  boxShadow: 24,
  p: 4,
};

const columns = [
  {
    id: 'name' as ActivityKey,
    name: 'Name',
  },
];

export default function EditIAP() {
  const auth = useAuth();
  const [openAdd, setOpenAdd] = useState(false);
  const [activityId, setActivityId] = useState<string>('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const search = useSearch({ from: '/edit-iap' });
  const [iapId] = useState<string>(search?.id || '');
  const { showError } = useError();

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const activityService = useMemo(() => {
    return new ActivitiesService();
  }, []);

  const token = () => {
    return auth?.user?.access_token || '';
  };

  const queryClient = useQueryClient();

  const {
    data: iaps,
    isLoading: isIapsLoading,
    error: iapsError,
  } = useQuery({
    queryKey: ['iaps'],
    queryFn: async () => {
      return iapService.getAll(token());
    },
  });

  if (iapsError) {
    throw iapsError;
  }

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

      if (iap.isDeployed) {
        router.navigate({ to: '/view-iap', search: { id: iapId } });
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
    queryKey: ['activities'],
    queryFn: async () => {
      return activityService.getAll(token());
    },
  });

  if (atError) {
    throw atError;
  }

  const addActivityMutation = useMutation({
    mutationFn: async () => {
      await iapService.addActivity(iap?._id || '', activityId, token());
    },

    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['iap'] })
        .then(() => setActivityId(''))
        .then(() => setOpenAdd(false));
    },
    onError: () => {
      showError('Failed to add the activity.');
    },
  });

  const removeActivityMutation = useMutation({
    mutationFn: async () => {
      await iapService.removeActivity(
        iap?._id || '',
        removeTarget?.id || '',
        token(),
      );
    },

    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['iap'] })
        .then(() => closeRemoveConfirmation());
    },
    onError: () => {
      showError('Failed to remove the activity.');
    },
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      await iapService.deploy(iap?._id || '', token());
    },

    onSuccess: () => {
      router.navigate({ to: '/view-iap', search: { id: iap?._id } });
    },
    onError: () => {
      showError('Failed to deploy IAP.');
    },
  });

  const mutations = {
    add: () => addActivityMutation.mutate(),
    remove: () => removeActivityMutation.mutate(),
    deploy: () => deployMutation.mutate(),
  };

  const openRemoveConfirmation = (id: string, name: string) => {
    setRemoveTarget({ id, name });
    setConfirmRemove(true);
  };

  const closeRemoveConfirmation = () => {
    setRemoveTarget(null);
    setConfirmRemove(false);
  };

  const handleOpenAdd = () => setOpenAdd(true);

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setActivityId('');
  };

  const isAddDisabled = !activityId.trim();

  const iapActivities = activityList
    ?.filter((a) => iap?.activityIds?.includes(a._id))
    .map((a, idx) => ({
      row: a,
      actions: [
        <Button
          key={`btn-${a._id}-${idx}`}
          variant="outlined"
          color="secondary"
          onClick={() => openRemoveConfirmation(a._id, a.name)}
          sx={{ marginLeft: 1 }}
        >
          Remove
        </Button>,
      ],
    }));

  const availableActivities = activityList?.filter(
    (a) => !iaps?.find((i) => i.activityIds.includes(a._id)),
  );

  if (isIapsLoading || isIapLoading || isActivitiesLoading) {
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
          Edit {iap?.name} IAP
        </Typography>
        <Typography component="div" sx={{ mr: 2 }}>
          <p>IAP ID: {iap?._id}</p>
          <p>IAP Description: {iap?.description}</p>
          <p>Deployed: {iap?.isDeployed ? 'Yes' : 'No'}</p>
        </Typography>
        <Container
          sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button
            disabled={iap?.activityIds?.length === 0}
            variant="contained"
            color="primary"
            onClick={mutations.deploy}
          >
            Deploy
          </Button>
        </Container>
        <Divider>Activities:</Divider>
        <FilterableTable
          columns={columns}
          sortBy={'name'}
          rows={iapActivities || []}
        />

        <Container
          sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            Add
          </Button>
        </Container>
      </Grid2>
      <Grid2>
        <Divider>Objectives:</Divider>

        <FilterableTable columns={[]} sortBy={'name'} rows={[]} />

        <Container
          sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button
            variant="contained"
            color="primary"
            disabled={iap?.activityIds?.length === 0}
          >
            Add
          </Button>
        </Container>
      </Grid2>
      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">Add Activity to IAP</h2>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Activity"
            name="activityId"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
          >
            {availableActivities?.map((ap) => (
              <MenuItem key={ap._id} value={ap._id}>
                {ap.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={mutations.add}
            disabled={isAddDisabled}
            style={{ marginTop: 16 }}
          >
            Add
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCloseAdd}
            style={{ marginTop: 16, marginLeft: 5 }}
          >
            Cancel
          </Button>
        </Box>
      </Modal>

      {/* Remove Confirmation Dialog */}
      <Dialog open={confirmRemove} onClose={closeRemoveConfirmation}>
        <DialogTitle>Remove Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove the activity {removeTarget?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRemoveConfirmation} color="primary">
            Cancel
          </Button>
          <Button onClick={mutations.remove} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Grid2>
  );
}
