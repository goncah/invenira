import { useNavigate } from 'react-router-dom';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IAPsService } from '../../services/iaps.service';
import { useAuth } from 'react-oidc-context';
import { Iap, IapKey } from '@invenira/model';
import { FilterableTable, FilterableTableRow } from '@invenira/components';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
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

  const auth = useAuth();
  const [rows, setRows] = useState<FilterableTableRow<Iap>[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState({ open: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const mapIaps = useCallback(
    (iaps: Iap[]) => {
      const token = auth?.user?.access_token || '';

      const handleView = (id: string) => {
        navigate(`/view-iap?id=${id}`);
      };

      const handleEdit = (id: string) => {
        navigate(`/edit-iap?id=${id}`);
      };

      const handleDeploy = (id: string) => {
        iapService
          .deploy(id, token)
          .then(() =>
            iapService.getAll(token).then((data) => setRows(mapIaps(data))),
          )
          .catch(() => handleError('Failed to deploy IAP.'));
      };

      return iaps.map((iap) => {
        const row = {
          row: iap,
          actions: [] as React.ReactElement[],
        };

        if (iap.isDeployed) {
          row.actions.push(
            <Button
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
              variant="outlined"
              color="primary"
              onClick={() => handleDeploy(iap._id)}
              style={{ marginLeft: row.actions.length > 0 ? 5 : 0 }}
            >
              Deploy
            </Button>,
          );
        }

        row.actions.push(
          <Button
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
    },
    [auth?.user?.access_token, iapService, navigate],
  );

  const token = useCallback(() => {
    return auth?.user?.access_token || '';
  }, [auth?.user?.access_token]);

  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    iapService
      .delete(deleteTarget.id, token())
      .then(() =>
        iapService.getAll(token()).then((data) => setRows(mapIaps(data))),
      )
      .catch(() => handleError('Failed to delete IAP.'))
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
    setName('');
    setDescription('');
  };

  const handleAdd = () => {
    iapService
      .create({ name, description }, token())
      .then((response) => response._id)
      .then((id) => {
        iapService.getAll(token()).then((data) => setRows(mapIaps(data)));
        return id;
      })
      .then((id) => {
        setName('');
        return id;
      })
      .then((id) => {
        setDescription('');
        return id;
      })
      .then((id) => {
        handleCloseAdd();
        return id;
      })
      .then((id) => {
        setOpenAdd(false);
        return id;
      })
      .then((id) => navigate(`/edit-iap?id=${id}`))
      .catch(() => handleError('Failed to add IAP.'));
  };

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  const isAddDisabled = !name.trim() || !description.trim();

  useEffect(() => {
    const token = auth?.user?.access_token || '';
    iapService
      .getAll(token)
      .then((iaps) => setRows(mapIaps(iaps)))
      .catch(() => handleError('Failed to load IAPs.'));
  }, [auth?.user?.access_token, iapService, mapIaps]);

  return (
    <>
      <Typography variant="h5" component="div" sx={{ mr: 2 }}>
        Inventive Activity Plans
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
