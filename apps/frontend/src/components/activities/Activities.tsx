import React, { useMemo, useState } from 'react';
import { ActivityProvidersService } from '../../services/activity-providers.service';
import { ActivitiesService } from '../../services/activities.service';
import { useAuth } from 'react-oidc-context';
import {
  CreateActivity,
  EnrichedActivity,
  EnrichedActivityKey,
} from '@invenira/model';
import { FilterableTable } from '@invenira/components';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useError } from '../layout/Layout';

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

const fullWindowStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  bgcolor: 'background.paper',
  border: 'none',
  boxShadow: 24,
  p: 4,
};

const columns = [
  {
    id: 'name' as EnrichedActivityKey,
    name: 'Name',
  },
  {
    id: 'ap' as EnrichedActivityKey,
    name: 'Activity Provider',
  },
  {
    id: 'createdAt' as EnrichedActivityKey,
    name: 'Created At',
  },
  {
    id: 'createdBy' as EnrichedActivityKey,
    name: 'Created By',
  },
  {
    id: 'updatedAt' as EnrichedActivityKey,
    name: 'Updated At',
  },
  {
    id: 'updatedBy' as EnrichedActivityKey,
    name: 'Updated By',
  },
];

export default function Activities() {
  const apService = useMemo(() => {
    return new ActivityProvidersService();
  }, []);

  const activityService = useMemo(() => {
    return new ActivitiesService();
  }, []);

  const queryClient = useQueryClient();

  const auth = useAuth();
  const [openAdd, setOpenAdd] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    activityProviderId: '',
    parameters: {},
  });
  const [iframeVisible, setIframeVisible] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { showError } = useError();

  const token = () => {
    const token = auth?.user?.access_token;
    return token || '';
  };

  const {
    isLoading: isApLoading,
    data: activityProviders,
    error: apError,
  } = useQuery({
    queryKey: ['activity-providers'],
    queryFn: async () => {
      return apService.getAll(token());
    },
  });

  if (apError) {
    throw apError;
  }

  const {
    isLoading: isAtLoading,
    data: activities,
    error: atError,
  } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const ats = await apService.getAll(token());
      return activityService.getAll(token()).then((activities) =>
        activities.map((activity) => {
          // eslint-disable-next-line
          (activity as any).ap = ats.find(
            (ap) => ap._id === activity.activityProviderId,
          )?.name;

          return {
            row: activity as EnrichedActivity,
            actions: [
              <Button
                key={`btn-${activity._id}-01`}
                variant="outlined"
                color="secondary"
                onClick={() =>
                  openDeleteConfirmation(activity._id, activity.name)
                }
                sx={{ marginLeft: 1 }}
              >
                Delete
              </Button>,
            ],
          };
        }),
      );
    },
  });

  if (atError) {
    throw atError;
  }

  const addActivityMutation = useMutation({
    mutationFn: async () => {
      return apService
        .getActivityParams(createData.activityProviderId, token())
        .then((params) => {
          const iframeWindow = document.getElementById(
            'configInterfaceIframe',
          ) as HTMLIFrameElement;
          let parameters = {};
          for (const param of params) {
            const val = iframeWindow?.contentDocument?.getElementById(
              param,
            ) as HTMLInputElement;

            if (!val) {
              throw new Error(`Missing parameter ${param}`);
            }

            parameters = { ...parameters, [param]: val.value };
          }

          return parameters;
        })
        .then(async (parameters) => {
          const activity = {
            ...createData,
            parameters: parameters,
          } as CreateActivity;
          return activityService.create(activity, token());
        });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['activities'] })
        .then(() =>
          setCreateData({ name: '', activityProviderId: '', parameters: {} }),
        )
        .then(() => handleCloseAdd());
    },
    onError: () => {
      showError('Failed to add Activity.');
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      return activityService.delete(deleteTarget.id, token());
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['activities'] })
        .then(() => closeDeleteConfirmation());
    },
    onError: () => {
      showError('Failed to delete Activity.');
    },
  });

  const mutations = {
    add: () => addActivityMutation.mutate(),
    delete: () => deleteActivityMutation.mutate(),
  };

  const openDeleteConfirmation = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setConfirmDelete(true);
  };

  const closeDeleteConfirmation = () => {
    setDeleteTarget(null);
    setConfirmDelete(false);
  };

  const handleOpenAdd = () => setOpenAdd(true);

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setCreateData({ name: '', activityProviderId: '', parameters: {} });
    setIframeVisible(false);
  };

  const handleNext = () => {
    if (createData.activityProviderId) {
      apService
        .getConfigInterfaceUrl(createData.activityProviderId, token())
        .then((url) => {
          setIframeUrl(
            window.location.origin +
              '/config-interface?interfaceUrl=' +
              encodeURIComponent(url),
          );
          setIframeVisible(true);
        })
        .catch(() => showError('Failed to fetch iframe URL.'));
    } else {
      showError('Please select an activity provider.');
    }
  };

  const isNextDisabled =
    !createData.name.trim() || !createData.activityProviderId.trim();

  if (isApLoading || isAtLoading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography
        variant="h5"
        component="div"
        sx={{ mr: 2, textAlign: 'center' }}
      >
        Activities
      </Typography>

      <FilterableTable
        columns={columns}
        sortBy={'name'}
        rows={activities || []}
      />

      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2, float: 'right' }}
        onClick={handleOpenAdd}
      >
        Add
      </Button>

      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={iframeVisible ? fullWindowStyle : style}>
          <h2 id="modal-modal-title">Add New Activity</h2>
          {!iframeVisible && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                value={createData.name}
                onChange={(e) =>
                  setCreateData({ ...createData, name: e.target.value })
                }
              />
              <TextField
                select
                fullWidth
                margin="normal"
                label="Activity Provider"
                name="activityProviderId"
                value={createData.activityProviderId}
                onChange={(e) =>
                  setCreateData({
                    ...createData,
                    activityProviderId: e.target.value,
                  })
                }
              >
                {activityProviders?.map((ap) => (
                  <MenuItem key={ap._id} value={ap._id}>
                    {ap.name}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={isNextDisabled}
                style={{ marginTop: 16 }}
              >
                Next
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseAdd}
                style={{ marginTop: 16, marginLeft: 5 }}
              >
                Cancel
              </Button>
            </>
          )}

          {iframeVisible && (
            <>
              <iframe
                id="configInterfaceIframe"
                src={iframeUrl}
                title="Activity Configuration Interface"
                style={{
                  width: '100%',
                  height: '75%',
                  border: '1px solid #ccc',
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={mutations.add}
                style={{ marginTop: 16 }}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseAdd}
                style={{ marginTop: 16, marginLeft: 5 }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={closeDeleteConfirmation}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the activity {deleteTarget?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} color="primary">
            Cancel
          </Button>
          <Button onClick={mutations.delete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
