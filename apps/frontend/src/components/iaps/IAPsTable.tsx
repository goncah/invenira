import { useEffect, useMemo, useState } from 'react';
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
import { IAPsService } from '../../services/iaps.service';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TableSortLabel,
} from '@mui/material';
import { useAuth } from 'react-oidc-context';
import { Iap, IapKey } from '@invenira/model';

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

export default function IAPsTable() {
  const navigate = useNavigate();

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const auth = useAuth();
  const [iapList, setIapList] = useState<Iap[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState({ open: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState<IapKey>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const token = auth?.user?.access_token;
    iapService
      .getAll(token!)
      .then((data) => setIapList(data))
      .catch(() => handleError('Failed to load IAPs.'));
  }, [auth?.user?.access_token, iapService]);

  const token = () => {
    const token = auth?.user?.access_token;
    return token!;
  };

  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    iapService
      .delete(deleteTarget.id, token())
      .then(() => iapService.getAll(token()).then((data) => setIapList(data)))
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

  const handleView = (id: string) => {
    navigate(`/view-iap?id=${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/edit-iap?id=${id}`);
  };

  const handleDeploy = (id: string) => {
    iapService
      .deploy(id, token())
      .then(() => iapService.getAll(token()).then((data) => setIapList(data)))
      .catch(() => handleError('Failed to deploy IAP.'));
  };

  const handleAdd = () => {
    iapService
      .create({ name, description }, token())
      .then((response) => response._id)
      .then((id) => {
        iapService.getAll(token()).then((data) => setIapList(data));
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

  const handleSort = (column: keyof any) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column as IapKey);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value.toLowerCase());
  };

  const filteredData = iapList.filter(
    (row) =>
      row.name.toLowerCase().includes(filter) ||
      (row.isDeployed ? 'Yes' : 'No').toLowerCase().includes(filter) ||
      new Date(row.createdAt)
        .toLocaleString('pt-pt')
        .toLowerCase()
        .includes(filter) ||
      row.createdBy.toLowerCase().includes(filter) ||
      new Date(row.updatedAt)
        .toLocaleString('pt-pt')
        .toLowerCase()
        .includes(filter) ||
      row.updatedBy.toLowerCase().includes(filter),
  );

  const sortedData = filteredData.sort((a, b) => {
    const isAsc = order === 'asc';
    if (a[orderBy] < b[orderBy]) return isAsc ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return isAsc ? 1 : -1;
    return 0;
  });

  return (
    <>
      <TextField
        label="Filter"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={handleFilterChange}
        placeholder="Search by any field"
      />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={order}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'isDeployed'}
                  direction={order}
                  onClick={() => handleSort('isDeployed')}
                >
                  Deployed
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={order}
                  onClick={() => handleSort('createdAt')}
                >
                  Created At
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdBy'}
                  direction={order}
                  onClick={() => handleSort('createdBy')}
                >
                  Created By
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'updatedAt'}
                  direction={order}
                  onClick={() => handleSort('updatedAt')}
                >
                  Updated At
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'updatedBy'}
                  direction={order}
                  onClick={() => handleSort('updatedBy')}
                >
                  Updated By
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.isDeployed ? 'Yes' : 'No'}</TableCell>
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
                    onClick={() => handleView(row._id)}
                  >
                    View
                  </Button>
                  {!row.isDeployed ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(row._id)}
                      style={{ marginLeft: 5 }}
                    >
                      Edit
                    </Button>
                  ) : (
                    ''
                  )}
                  {!row.isDeployed ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleDeploy(row._id)}
                      style={{ marginLeft: 5 }}
                    >
                      Deploy
                    </Button>
                  ) : (
                    ''
                  )}
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => openDeleteConfirmation(row._id, row.name)}
                    style={{ marginLeft: 5 }}
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
