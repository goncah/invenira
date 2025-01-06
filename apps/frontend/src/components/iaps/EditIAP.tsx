import { useNavigate, useSearchParams } from 'react-router-dom';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { IAPsService } from '../../services/iaps.service';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useAuth } from 'react-oidc-context';
import { ActivityKey } from '@invenira/model';
import { ActivitiesService } from '../../services/activities.service';
import { FilterableTable } from '@invenira/components';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
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
import { useMutation, useQuery, useQueryClient } from 'react-query';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const [error, setError] = React.useState({ open: false, message: '' });
  const [openAdd, setOpenAdd] = useState(false);
  const [activityId, setActivityId] = useState<string>('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const activityService = useMemo(() => {
    return new ActivitiesService();
  }, []);

  const queryClient = useQueryClient();

  const { data: iap, isLoading: isIapLoading } = useQuery(
    ['iap', searchParams.get('id')],
    async () => {
      const token = auth?.user?.access_token || '';
      const id = searchParams.get('id') || '';
      return iapService.getOne(id, token);
    },
    {
      onSuccess: (data) => {
        if (data.isDeployed) {
          navigate(`/view-iap?id=${searchParams.get('id')}`);
        }
      },
      onError: () => {
        handleError('Failed to load IAP.');
      },
    },
  );

  const { data: activityList, isLoading: isActivitiesLoading } = useQuery(
    ['activities'],
    async () => {
      const token = auth?.user?.access_token || '';
      return activityService.getAll(token);
    },
    {
      onError: () => {
        handleError('Failed to load activities.');
      },
    },
  );

  const addActivityMutation = useMutation(
    async () => {
      const token = auth?.user?.access_token || '';
      await iapService.addActivity(iap?._id || '', activityId, token);
    },
    {
      onSuccess: () => {
        queryClient
          .invalidateQueries(['iap'])
          .then(() => setActivityId(''))
          .then(() => setOpenAdd(false));
      },
      onError: () => {
        handleError('Failed to add the activity.');
      },
    },
  );

  const removeActivityMutation = useMutation(
    async () => {
      const token = auth?.user?.access_token || '';
      await iapService.removeActivity(
        iap?._id || '',
        removeTarget?.id || '',
        token,
      );
    },
    {
      onSuccess: () => {
        queryClient
          .invalidateQueries(['iap'])
          .then(() => closeRemoveConfirmation());
      },
      onError: () => {
        handleError('Failed to remove the activity.');
      },
    },
  );

  const deployMutation = useMutation(
    async () => {
      const token = auth?.user?.access_token || '';
      await iapService.deploy(iap?._id || '', token);
    },
    {
      onSuccess: () => {
        navigate(`/view-iap?id=${iap?._id}`);
      },
      onError: () => {
        handleError('Failed to deploy IAP.');
      },
    },
  );

  const mutations = {
    add: () => addActivityMutation.mutate(),
    remove: () => removeActivityMutation.mutate(),
    deploy: () => deployMutation.mutate(),
  };

  const handleError = useCallback(
    (message: string) => {
      setError({ open: true, message });
    },
    [setError],
  );

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
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

  const rows = activityList
    ? activityList
        .filter((a) => iap?.activityIds?.includes(a._id))
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
        }))
    : [];

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
        <FilterableTable columns={columns} sortBy={'name'} rows={rows} />

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
      </Grid2>

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
      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">Add New Activity</h2>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Activity"
            name="activityId"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
          >
            {activityList
              ?.filter((a) => !iap?.activityIds?.includes(a._id))
              .map((ap) => (
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
    </Grid2>
  );
}
