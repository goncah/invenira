import { useNavigate, useSearchParams } from 'react-router-dom';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IAPsService } from '../../services/iaps.service';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useAuth } from 'react-oidc-context';
import { Activity, ActivityKey, Iap } from '@invenira/model';
import { ActivitiesService } from '../../services/activities.service';
import { FilterableTable, FilterableTableRow } from '@invenira/components';
import Typography from '@mui/material/Typography';
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
  const [iap, setIap] = useState<Iap>({} as unknown as Iap);
  const [error, setError] = React.useState({ open: false, message: '' });
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [rows, setRows] = useState<FilterableTableRow<Activity>[]>([]);
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

  const handleError = useCallback(
    (message: string) => {
      setError({ open: true, message });
    },
    [setError],
  );

  const fetchAndMap = () => {
    const token = auth?.user?.access_token || '';
    activityService
      .getAll(token)
      .then((activities) => {
        setActivityList(activities);
        return activities;
      })
      .then((activities) => {
        setRows(
          activities
            .filter((a) => iap.activityIds?.includes(a._id))
            .map((a) => {
              return {
                row: a,
                actions: [
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => openRemoveConfirmation(a._id, a.name)}
                    sx={{ marginLeft: 1 }}
                  >
                    Remove
                  </Button>,
                ],
              };
            }),
        );
      })
      .catch(() => handleError('Failed to load IAP activities.'));
  };

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  useEffect(() => {
    const token = auth?.user?.access_token || '';
    const _id = searchParams.get('id') || '';
    iapService
      .getOne(_id, token)
      .then((data) => {
        if (data.isDeployed) {
          navigate(`/view-iap?id=${_id}`);
        } else {
          setIap(data as unknown as Iap);
          return activityService.getAll(token);
        }
      })
      .then((activities) => {
        if (activities) {
          setActivityList(activities);
          return activities;
        }
      })
      .then((activities) => {
        if (activities) {
          setRows(
            activities
              .filter((a) => iap.activityIds?.includes(a._id))
              .map((a) => {
                return {
                  row: a,
                  actions: [
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => openRemoveConfirmation(a._id, a.name)}
                      sx={{ marginLeft: 1 }}
                    >
                      Remove
                    </Button>,
                  ],
                };
              }),
          );
        }
      })
      .catch(() => handleError('Failed to load IAP.'));
  }, [
    activityService,
    auth?.user?.access_token,
    handleError,
    iap.activityIds,
    iapService,
    navigate,
    searchParams,
  ]);

  const token = () => {
    return auth?.user?.access_token || '';
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    iapService
      .removeActivity(iap._id, removeTarget.id, token())
      .then(
        () =>
          (iap.activityIds = iap.activityIds.filter(
            (i) => i !== removeTarget.id,
          )),
      )
      .then(() => fetchAndMap())
      .catch(() => handleError('Failed to delete the activity provider.'))
      .finally(() => closeRemoveConfirmation());
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

  const handleAdd = () => {
    iapService
      .addActivity(iap._id, activityId, token())
      .then(() => iap.activityIds.push(activityId))
      .then(() => fetchAndMap())
      .then(() => setActivityId(''))
      .then(() => setOpenAdd(false))
      .catch(() => handleError('Failed to add the activity.'));
  };

  const isAddDisabled = !activityId.trim();

  return (
    <>
      <h2>Edit {iap.name} IAP</h2>
      <p>IAP ID: {iap._id}</p>
      <p>IAP Description: {iap.description}</p>
      <p>Deployed: {iap.isDeployed ? 'Yes' : 'No'}</p>

      <Typography variant="h5" component="div" sx={{ mr: 70 }}>
        Activities:
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
            {activityList.map((ap) => (
              <MenuItem key={ap._id} value={ap._id}>
                {ap.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
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
          <Button onClick={handleRemove} color="error">
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
    </>
  );
}
