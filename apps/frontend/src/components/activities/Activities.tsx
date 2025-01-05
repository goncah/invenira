import React, { useEffect, useMemo, useState } from 'react';
import { ActivityProvidersService } from '../../services/activity-providers.service';
import { ActivitiesService } from '../../services/activities.service';
import { useAuth } from 'react-oidc-context';
import {
  ActivityProvider,
  CreateActivity,
  EnrichedActivity,
  EnrichedActivityKey,
} from '@invenira/model';
import { FilterableTable, FilterableTableRow } from '@invenira/components';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

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

  const auth = useAuth();
  const [rows, setRows] = useState<FilterableTableRow<EnrichedActivity>[]>([]);
  const [apList, setAplist] = useState<ActivityProvider[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    activityProviderId: '',
    parameters: {},
  });
  const [iframeVisible, setIframeVisible] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [error, setError] = useState({ open: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const token = () => {
    const token = auth?.user?.access_token;
    return token || '';
  };

  const fetchAndMap = () => {
    const token = auth?.user?.access_token || '';

    apService
      .getAll(token)
      .then(async (aps) => {
        setAplist(aps);
        const activities = await activityService.getAll(token);
        setRows(
          activities.map((a) => {
            // eslint-disable-next-line
            (a as any).ap = aps.find(
              (ap) => ap._id === a.activityProviderId,
            )?.name;

            return {
              row: a as EnrichedActivity,
              actions: [
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => openDeleteConfirmation(a._id, a.name)}
                  sx={{ marginLeft: 1 }}
                >
                  Delete
                </Button>,
              ],
            };
          }),
        );
      })
      .catch(() => handleError('Failed to load activities.'));
  };

  useEffect(fetchAndMap, [
    activityService,
    apService,
    auth?.user?.access_token,
  ]);

  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    activityService
      .delete(deleteTarget.id, token())
      .then(() => fetchAndMap())
      .catch(() => handleError('Failed to delete activity.'))
      .finally(() => closeDeleteConfirmation());
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
    setFormData({ name: '', activityProviderId: '', parameters: {} });
    setIframeVisible(false);
  };

  const handleNext = () => {
    if (formData.activityProviderId) {
      apService
        .getConfigInterfaceUrl(formData.activityProviderId, token())
        .then((url) => {
          setIframeUrl(
            window.location.origin +
              '/config-interface?interfaceUrl=' +
              encodeURIComponent(url),
          );
          setIframeVisible(true);
        })
        .catch(() => handleError('Failed to fetch iframe URL.'));
    } else {
      handleError('Please select an activity provider.');
    }
  };

  const handleAdd = () => {
    apService
      .getActivityParams(formData.activityProviderId, token())
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
          ...formData,
          parameters: parameters,
        } as CreateActivity;
        await activityService.create(activity, token());
        fetchAndMap();
        setFormData({ name: '', activityProviderId: '', parameters: {} });
        handleCloseAdd();
      })
      .catch((e: Error) =>
        handleError(`Failed to add the activity: ${e.message}`),
      );
  };

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  const isNextDisabled =
    !formData.name.trim() || !formData.activityProviderId.trim();

  return (
    <>
      <Typography
        variant="h5"
        component="div"
        sx={{ mr: 2, textAlign: 'center' }}
      >
        Activities
      </Typography>

      <FilterableTable columns={columns} sortBy={'name'} rows={rows} />

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
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <TextField
                select
                fullWidth
                margin="normal"
                label="Activity Provider"
                name="activityProviderId"
                value={formData.activityProviderId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activityProviderId: e.target.value,
                  })
                }
              >
                {apList.map((ap) => (
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
                onClick={handleAdd}
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
          <Button onClick={handleDelete} color="error">
            Delete
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
    </>
  );
}
