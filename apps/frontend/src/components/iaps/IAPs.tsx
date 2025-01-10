import React, { useMemo, useState } from 'react';
import { IAPsService } from '../../services/iaps.service';
import { useAuth } from 'react-oidc-context';
import { Iap, IapKey } from '@invenira/model';
import {
  FilterableTable,
  SmoothDialog,
  SmoothModal,
} from '@invenira/components';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useError } from '../layout/Layout';
import { router } from '../../App';

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
  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const queryClient = useQueryClient();
  const auth = useAuth();
  const [openAdd, setOpenAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { showError } = useError();

  const token = () => {
    return auth?.user?.access_token || '';
  };

  const deployMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = auth?.user?.access_token || '';
      await iapService.deploy(id, token);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iaps'] }).then(() => null);
    },
    onError: () => {
      showError('Failed to deploy IAP.');
    },
  });

  const mapIaps = (iaps: Iap[]) => {
    const handleView = (id: string) => {
      router.navigate({ to: '/view-iap', search: { id } });
    };

    const handleEdit = (id: string) => {
      router.navigate({ to: '/edit-iap', search: { id } });
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

  const {
    data: iaps,
    isLoading: isIapsLoading,
    error: iapError,
  } = useQuery({
    queryKey: ['iaps'],
    queryFn: async () => {
      return iapService.getAll(token()).then((iaps) => mapIaps(iaps));
    },
  });

  if (iapError) {
    throw iapError;
  }

  const addIapMutation = useMutation({
    mutationFn: async () => {
      return iapService.create({ name, description }, token());
    },

    onSuccess: (iap) => {
      queryClient
        .invalidateQueries({ queryKey: ['iaps'] })
        .then(() =>
          router.navigate({ to: '/edit-iap', search: { id: iap._id } }),
        );
    },
    onError: () => {
      showError('Failed to add IAP.');
    },
  });

  const deleteIapMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      return iapService.delete(deleteTarget.id, token());
    },

    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['iaps'] })
        .then(() => closeDeleteConfirmation());
    },
    onError: () => {
      showError('Failed to delete IAP.');
    },
  });

  const mutations = {
    add: () => addIapMutation.mutate(),
    delete: () => deleteIapMutation.mutate(),
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

      <SmoothModal open={openAdd} onClose={handleCloseAdd} fullscreen={openAdd}>
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
      </SmoothModal>

      <SmoothDialog
        title={'Delete Confirmation'}
        content={`Are you sure you want to delete the IAP ${deleteTarget?.name}?`}
        open={confirmDelete}
        onClose={closeDeleteConfirmation}
        onConfirm={mutations.delete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
