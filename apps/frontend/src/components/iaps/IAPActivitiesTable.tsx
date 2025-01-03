import * as React from 'react';
import { useEffect, useMemo } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { ActivitiesService } from '../../services/activities.service';
import MenuItem from '@mui/material/MenuItem';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { IAPsService } from '../../services/iaps.service';
import { useAuth } from 'react-oidc-context';

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

interface IAPActivitiesTableProps {
  iapId: string | undefined;
  activityIds: string[] | undefined;
}

export default function IAPActivitiesTable({
  iapId,
  activityIds,
}: IAPActivitiesTableProps) {
  const activityService = useMemo(() => {
    return new ActivitiesService();
  }, []);

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const auth = useAuth();
  const [activityList, setActivityList] = React.useState([] as any[]);
  const [iapActivityList, setIapActivityList] = React.useState([] as any[]);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [activityId, setActivityId] = React.useState<string>('');
  const [error, setError] = React.useState({ open: false, message: '' });
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [removeTarget, setRemoveTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchAndMap = () => {
    const token = auth?.user?.access_token;
    activityService
      .getAll(token!)
      .then((activities) => {
        setActivityList(activities);
        return activities;
      })
      .then((activities) =>
        setIapActivityList(
          activities.filter((a) => activityIds?.includes(a._id)),
        ),
      )
      .catch(() => handleError('Failed to load IAP activities.'));
  };

  useEffect(fetchAndMap, [
    activityIds,
    activityService,
    auth?.user?.access_token,
  ]);

  const token = () => {
    const token = auth?.user?.access_token;
    return token!;
  };

  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    iapService
      .removeActivity(iapId!, removeTarget.id, token())
      .then(
        () => (activityIds = activityIds?.filter((i) => i !== removeTarget.id)),
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
      .addActivity(iapId!, activityId, token())
      .then(() => activityIds?.push(activityId))
      .then(() => fetchAndMap())
      .then(() => setActivityId(''))
      .then(() => setOpenAdd(false))
      .catch(() => handleError('Failed to add the activity.'));
  };

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  const isAddDisabled = !activityId.trim();

  return (
    <>
      <Typography variant="h5" component="div" sx={{ mr: 70 }}>
        Activities:
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {iapActivityList.map((row) => (
              <TableRow
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => openRemoveConfirmation(row._id, row.name)}
                    sx={{ marginLeft: 1 }}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
