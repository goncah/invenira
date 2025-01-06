import React, { useMemo, useState } from 'react';
import { ActivityProvider } from '@invenira/model';
import { FilterableTable } from '@invenira/components';
import { ActivityProvidersService } from '../../services/activity-providers.service';
import { useAuth } from 'react-oidc-context';
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
  const queryClient = useQueryClient();

  const [error, setError] = useState({ open: false, message: '' });
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [createData, setCreateData] = useState({ name: '', url: '' });
  const [editData, setEditData] = useState({ id: '', url: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const token = () => {
    return auth?.user?.access_token || '';
  };

  const { data: activityProviders, isLoading: isApLoading } = useQuery(
    ['activity-providers'],
    async () => {
      return apService.getAll(token()).then((data) =>
        data.map((row, idx) => {
          return {
            row: row,
            actions: [
              <Button
                key={`btn-${row._id}-${idx}-01`}
                variant="outlined"
                color="primary"
                onClick={() => handleOpenEdit(row._id, row.url)}
              >
                Edit
              </Button>,
              <Button
                key={`btn-${row._id}-${idx}-02`}
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
    },
    {
      onError: () => {
        handleError('Failed to load Activity Providers.');
      },
    },
  );

  const addActivityProviderMutation = useMutation(
    async () => {
      const newAp = { ...createData } as ActivityProvider;
      return apService.create(newAp, token());
    },
    {
      onSuccess: () => {
        queryClient
          .invalidateQueries(['activity-providers'])
          .then(() => setCreateData({ name: '', url: '' }))
          .then(() => setOpenAdd(false));
      },
      onError: () => {
        handleError('Failed to add Activity Provider.');
      },
    },
  );

  const deleteActivityProviderMutation = useMutation(
    async () => {
      if (!deleteTarget) return;
      return apService.delete(deleteTarget.id, token());
    },
    {
      onSuccess: () => {
        queryClient
          .invalidateQueries(['activity-providers'])
          .then(() => setCreateData({ name: '', url: '' }))
          .then(() => setOpenAdd(false))
          .then(() => setDeleteTarget(null))
          .then(() => setConfirmDelete(false));
      },
      onError: () => {
        handleError('Failed to delete Activity Provider.');
      },
    },
  );

  const editActivityProviderMutation = useMutation(
    async () => {
      return apService.update(editData.id, { url: editData.url }, token());
    },
    {
      onSuccess: () => {
        queryClient
          .invalidateQueries(['activity-providers'])
          .then(() => setEditData({ id: '', url: '' }))
          .then(() => setOpenEdit(false));
      },
      onError: () => {
        handleError('Failed to edit Activity Provider.');
      },
    },
  );

  const mutations = {
    add: () => addActivityProviderMutation.mutate(),
    edit: () => editActivityProviderMutation.mutate(),
    delete: () => deleteActivityProviderMutation.mutate(),
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

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setCreateData({ name: '', url: '' });
  };

  const handleOpenEdit = (id: string, url: string) => {
    setEditData({ id, url });
    setOpenEdit(true);
  };

  const handleCloseEdit = () => setOpenEdit(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateData({ ...createData, [name]: value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditData({ ...editData, url: value });
  };

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  const isAddDisabled = !createData.name.trim() || !createData.url.trim();

  if (isApLoading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography
        variant="h5"
        component="div"
        sx={{ mr: 2, textAlign: 'center' }}
      >
        Activity Providers
      </Typography>
      <FilterableTable
        columns={columns}
        sortBy={'name'}
        rows={activityProviders || []}
      />

      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2, float: 'right' }}
        onClick={() => setOpenAdd(true)}
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
            value={createData.name}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="URL"
            name="url"
            value={createData.url}
            onChange={handleInputChange}
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
            onClick={mutations.edit}
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
