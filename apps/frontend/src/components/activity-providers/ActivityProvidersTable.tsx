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
import { ActivityProvidersService } from '../../services/activity-providers.service';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
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

export default function ActivityProvidersTable() {
  const apService = useMemo(() => {
    return new ActivityProvidersService();
  }, []);

  const auth = useAuth();
  const [apList, setAplist] = React.useState([] as any[]);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', url: '' });
  const [editData, setEditData] = React.useState({ id: '', url: '' });
  const [error, setError] = React.useState({ open: false, message: '' });
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const token = () => {
    const token = auth?.user?.access_token;
    return token!;
  };

  useEffect(() => {
    const token = auth?.user?.access_token;
    apService
      .getAll(token!)
      .then((data) => setAplist(data))
      .catch(() => handleError('Failed to load Activity Providers.'));
  }, [apService, auth?.user?.access_token]);

  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  const handleEdit = (id: string, url: string) => {
    apService
      .update(id, { url }, token())
      .then(() => apService.getAll(token()).then((data) => setAplist(data)))
      .then(() => setOpenEdit(false))
      .catch(() => handleError('Failed to update the activity provider.'));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    apService
      .delete(deleteTarget.id, token())
      .then(() => apService.getAll(token()).then((data) => setAplist(data)))
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

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditInputChange = (e: any) => {
    const { value } = e.target;
    setEditData({ ...editData, url: value });
  };

  const handleAdd = () => {
    const newEntry = { ...formData };
    apService
      .create(newEntry, token())
      .then(() => apService.getAll(token()).then((data) => setAplist(data)))
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
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apList.map((row) => (
              <TableRow
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.url}</TableCell>
                <TableCell>
                  {new Date(row.createdAt).toLocaleString('pt-pt')}
                </TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell>
                  {new Date(row.updatedAt).toLocaleString('pt-pt')}
                </TableCell>
                <TableCell>{row.updatedBy}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenEdit(row._id, row.url)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => openDeleteConfirmation(row._id, row.name)}
                    sx={{ marginLeft: 1 }}
                  >
                    Delete
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
