import React, { useMemo, useState } from 'react';
import { ActivityProvider } from '@invenira/model';
import {
  FilterableTable,
  SmoothDialog,
  SmoothModal,
} from '@invenira/components';
import { ActivityProvidersService } from '../../services/activity-providers.service';
import { useAuth } from 'react-oidc-context';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useError } from '../layout/Layout';

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

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [createData, setCreateData] = useState({ name: '', url: '' });
  const [editData, setEditData] = useState({ id: '', url: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { showError } = useError();

  const token = () => {
    return auth?.user?.access_token || '';
  };

  const bodyBackgroundColor = getComputedStyle(document.body).backgroundColor;

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    backgroundColor: bodyBackgroundColor,
    border: '1px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '12px',
  };

  const {
    isLoading: isApLoading,
    data: activityProviders,
    error: apError,
  } = useQuery({
    queryKey: ['activity-providers'],
    queryFn: async () => {
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
  });

  if (apError) {
    throw apError;
  }

  const addActivityProviderMutation = useMutation({
    mutationFn: async () => {
      const newAp = { ...createData } as ActivityProvider;
      return apService.create(newAp, token());
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['activity-providers'] })
        .then(() => setCreateData({ name: '', url: '' }))
        .then(() => setOpenAdd(false));
    },
    onError: () => {
      showError('Failed to add Activity Provider.');
    },
  });

  const deleteActivityProviderMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      return apService.delete(deleteTarget.id, token());
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['activity-providers'] })
        .then(() => setCreateData({ name: '', url: '' }))
        .then(() => setOpenAdd(false))
        .then(() => setDeleteTarget(null))
        .then(() => setConfirmDelete(false));
    },
    onError: () => {
      showError('Failed to delete Activity Provider.');
    },
  });

  const editActivityProviderMutation = useMutation({
    mutationFn: async () => {
      return apService.update(editData.id, { url: editData.url }, token());
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['activity-providers'] })
        .then(() => setEditData({ id: '', url: '' }))
        .then(() => setOpenEdit(false));
    },
    onError: () => {
      showError('Failed to edit Activity Provider.');
    },
  });

  const mutations = {
    add: () => addActivityProviderMutation.mutate(),
    edit: () => editActivityProviderMutation.mutate(),
    delete: () => deleteActivityProviderMutation.mutate(),
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

      <SmoothModal open={openAdd} onClose={handleCloseAdd} fullscreen={false}>
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
      </SmoothModal>

      <SmoothModal open={openEdit} onClose={handleCloseEdit} fullscreen={false}>
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
      </SmoothModal>

      <SmoothDialog
        title={'Delete Confirmation'}
        content={`Are you sure you want to delete the activity provider ${deleteTarget?.name}?`}
        open={confirmDelete}
        onClose={closeDeleteConfirmation}
        onConfirm={mutations.delete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
