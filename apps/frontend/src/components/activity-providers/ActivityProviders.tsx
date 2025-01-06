import React, { useEffect, useMemo, useState } from 'react';
import { ActivityProvider } from '@invenira/model';
import { FilterableTable, FilterableTableRow } from '@invenira/components';
import { ActivityProvidersService } from '../../services/activity-providers.service';
import { useAuth } from 'react-oidc-context';
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
    id: 'name' as keyof ActivityProvider,
    name: 'Name',
  },
  {
    id: 'url' as keyof ActivityProvider,
    name: 'URL',
  },
  {
    id: 'createdAt' as keyof ActivityProvider,
    name: 'Created At',
  },
  {
    id: 'createdBy' as keyof ActivityProvider,
    name: 'Created By',
  },
  {
    id: 'updatedAt' as keyof ActivityProvider,
    name: 'Updated At',
  },
  {
    id: 'updatedBy' as keyof ActivityProvider,
    name: 'Updated By',
  },
];

export default function ActivityProviders() {
  const apService = useMemo(() => {
    return new ActivityProvidersService();
  }, []);
  const auth = useAuth();

  const [rows, setRows] = useState<FilterableTableRow<ActivityProvider>[]>([]);
  const [error, setError] = useState({ open: false, message: '' });
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '' });
  const [editData, setEditData] = useState({ id: '', url: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const setData = (data: ActivityProvider[]) => {
    setRows(
      data.map((row) => {
        return {
          row: row,
          actions: [
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleOpenEdit(row._id, row.url)}
            >
              Edit
            </Button>,
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => openDeleteConfirmation(row._id, row.name)}
              sx={{ marginLeft: 1 }}
            >
              Delete
            </Button>,
          ],
        };
      }),
    );
  };

  useEffect(() => {
    const token = auth?.user?.access_token || '';

    apService
      .getAll(token)
      .then((data) => {
        setRows(
          data.map((row) => {
            return {
              row: row,
              actions: [
                <Button
                  key={`btn-${row._id}-01`}
                  variant="outlined"
                  color="primary"
                  onClick={() => handleOpenEdit(row._id, row.url)}
                >
                  Edit
                </Button>,
                <Button
                  key={`btn-${row._id}-02`}
                  variant="outlined"
                  color="secondary"
                  onClick={() => openDeleteConfirmation(row._id, row.name)}
                  sx={{ marginLeft: 1 }}
                >
                  Delete
                </Button>,
              ],
            };
          }),
        );
      })
      .catch(() => handleError('Failed to load Activity Providers.'));
  }, [apService, auth?.user?.access_token]);

  const token = () => {
    return auth?.user?.access_token || '';
  };

  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  const handleEdit = (id: string, url: string) => {
    apService
      .update(id, { url }, token())
      .then(() => apService.getAll(token()).then((data) => setData(data)))
      .then(() => setOpenEdit(false))
      .catch(() => handleError('Failed to update the activity provider.'));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    apService
      .delete(deleteTarget.id, token())
      .then(() => apService.getAll(token()).then((data) => setData(data)))
      .catch(() => handleError('Failed to delete the activity provider.'))
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
    setFormData({ name: '', url: '' });
  };

  const handleOpenEdit = (id: string, url: string) => {
    setEditData({ id, url });
    setOpenEdit(true);
  };

  const handleCloseEdit = () => setOpenEdit(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditData({ ...editData, url: value });
  };

  const handleAdd = () => {
    const newEntry = { ...formData };
    apService
      .create(newEntry, token())
      .then(() => apService.getAll(token()).then((data) => setData(data)))
      .then(() => setFormData({ name: '', url: '' }))
      .then(() => handleCloseAdd())
      .catch(() => handleError('Failed to add the activity provider.'));
  };

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  const isAddDisabled = !formData.name.trim() || !formData.url.trim();

  return (
    <>
      <Typography
        variant="h5"
        component="div"
        sx={{ mr: 2, textAlign: 'center' }}
      >
        Activity Providers
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
          <h2 id="modal-modal-title">Add New Activity Provider</h2>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
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

      {/* Edit Modal */}
      <Modal
        open={openEdit}
        onClose={handleCloseEdit}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">Edit Activity Provider</h2>
          <TextField
            fullWidth
            margin="normal"
            label="URL"
            name="url"
            value={editData.url}
            onChange={handleEditInputChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleEdit(editData.id, editData.url)}
            sx={{ marginTop: 2 }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCloseEdit}
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
            Are you sure you want to delete the activity provider{' '}
            {deleteTarget?.name}?
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
