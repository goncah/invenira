import { useNavigate } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import { IAPsService } from '../../services/iaps.service';
import { useAuth } from 'react-oidc-context';
import { Iap, IapKey } from '@invenira/model';
import { FilterableTable } from '@invenira/components';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
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
    id: 'name' as IapKey,
    name: 'Name',
  },
  {
    id: 'isDeployed' as IapKey,
    name: 'Deployed',
  },
  {
    id: 'createdAt' as IapKey,
    name: 'Created At',
  },
  {
    id: 'createdBy' as IapKey,
    name: 'Created By',
  },
  {
    id: 'updatedAt' as IapKey,
    name: 'Updated At',
  },
  {
    id: 'updatedBy' as IapKey,
    name: 'Updated By',
  },
];

export default function IAPs() {
  const navigate = useNavigate();

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const queryClient = useQueryClient();
  const auth = useAuth();
  const [openAdd, setOpenAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState({ open: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const token = () => {
    return auth?.user?.access_token || '';
  };

  const deployMutation = useMutation(
    async (id: string) => {
      const token = auth?.user?.access_token || '';
      await iapService.deploy(id, token);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['iaps']).then(() => null);
      },
      onError: () => {
        handleError('Failed to deploy IAP.');
      },
    },
  );

  const mapIaps = (iaps: Iap[]) => {
    const handleView = (id: string) => {
      navigate(`/view-iap?id=${id}`);
    };

    const handleEdit = (id: string) => {
      navigate(`/edit-iap?id=${id}`);
    };

    return iaps.map((iap) => {
      const row = {
        row: iap,
        actions: [] as React.ReactElement[],
      };

      if (iap.isDeployed) {
        row.actions.push(
          <Button
            key={`btn-${iap._id}-01`}
            variant="outlined"
            color="primary"
            onClick={() => handleView(iap._id)}
          >
            View
          </Button>,
        );
      }

      if (!iap.isDeployed) {
        row.actions.push(
          <Button
            key={`btn-${iap._id}-02`}
            variant="outlined"
            color="primary"
            onClick={() => handleEdit(iap._id)}
            style={{ marginLeft: row.actions.length > 0 ? 5 : 0 }}
          >
            Edit
          </Button>,
        );
      }

      if (!iap.isDeployed && iap.activityIds.length > 0) {
        row.actions.push(
          <Button
            key={`btn-${iap._id}-03`}
            variant="outlined"
            color="primary"
            onClick={() => deployMutation.mutate(iap._id)}
            style={{ marginLeft: row.actions.length > 0 ? 5 : 0 }}
          >
            Deploy
          </Button>,
        );
      }

      row.actions.push(
        <Button
          key={`btn-${iap._id}-04`}
          variant="outlined"
          color="secondary"
          onClick={() => openDeleteConfirmation(iap._id, iap.name)}
          style={{ marginLeft: row.actions.length > 0 ? 5 : 0 }}
        >
          Delete
        </Button>,
      );

      return row;
    });
  };

  const { data: iaps, isLoading: isIapsLoading } = useQuery(
    ['iaps'],
    async () => {
      return iapService.getAll(token()).then((iaps) => mapIaps(iaps));
    },
    {
      onError: () => {
        handleError('Failed to load IAPs.');
      },
    },
  );

  const addIapMutation = useMutation(
    async () => {
      return iapService.create({ name, description }, token());
    },
    {
      onSuccess: (iap) => {
        queryClient
          .invalidateQueries(['iaps'])
          .then(() => navigate(`/edit-iap?id=${iap._id}`));
      },
      onError: () => {
        handleError('Failed to add IAP.');
      },
    },
  );

  const deleteIapMutation = useMutation(
    async () => {
      if (!deleteTarget) return;
      return iapService.delete(deleteTarget.id, token());
    },
    {
      onSuccess: () => {
        queryClient
          .invalidateQueries(['iaps'])
          .then(() => closeDeleteConfirmation());
      },
      onError: () => {
        handleError('Failed to delete IAP.');
      },
    },
  );

  const mutations = {
    add: () => addIapMutation.mutate(),
    delete: () => deleteIapMutation.mutate(),
  };

  const handleError = (message: string) => {
    setError({ open: true, message });
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
    setName('');
    setDescription('');
  };

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  const isAddDisabled = !name.trim() || !description.trim();

  if (isIapsLoading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography
        variant="h5"
        component="div"
        sx={{ mr: 2, textAlign: 'center' }}
      >
        Inventive Activity Plans
      </Typography>
      <FilterableTable columns={columns} sortBy={'name'} rows={iaps || []} />

      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2, float: 'right' }}
        onClick={handleOpenAdd}
      >
        Add
      </Button>

      {/* Add Modal */}
      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">Add New IAP</h2>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={closeDeleteConfirmation}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the IAP {deleteTarget?.name}?
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
