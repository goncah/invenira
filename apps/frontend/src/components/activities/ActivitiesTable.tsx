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
import { ActivityProvidersService } from '../../services/activity-providers.service';
import { ActivitiesService } from '../../services/activities.service';
import MenuItem from '@mui/material/MenuItem';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TableSortLabel,
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

const fullWindowStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  bgcolor: 'background.paper',
  border: 'none',
  boxShadow: 24,
  p: 4,
};

export default function ActivitiesTable() {
  const apService = useMemo(() => {
    return new ActivityProvidersService();
  }, []);

  const activityService = useMemo(() => {
    return new ActivitiesService();
  }, []);

  const auth = useAuth();
  const [apList, setAplist] = useState([] as any[]);
  const [activityList, setActivityList] = useState([] as any[]);
  const [openAdd, setOpenAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    activityProviderId: '',
    parameters: {},
  });
  const [iframeVisible, setIframeVisible] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [error, setError] = useState({ open: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState<keyof any>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const token = () => {
    const token = auth?.user?.access_token;
    return token!;
  };

  const fetchAndMap = () => {
    const token = auth?.user?.access_token;
    apService
      .getAll(token!)
      .then((aps) => {
        setAplist(aps);
        return aps;
      })
      .then(async (aps) => {
        const activities = await activityService.getAll(token!);
        setActivityList(
          activities.map((a) => {
            a['ap'] = aps.find((ap) => ap._id === a.activityProviderId).name;
            return a;
          }),
        );
      })
      .catch(() => handleError('Failed to load activities.'));
  };

  useEffect(fetchAndMap, [
    activityService,
    apService,
    auth?.user?.access_token,
  ]);

  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    activityService
      .delete(deleteTarget.id, token())
      .then(() => fetchAndMap())
      .catch(() => handleError('Failed to delete activity.'))
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
    setFormData({ name: '', activityProviderId: '', parameters: {} });
    setIframeVisible(false);
  };

  const handleNext = () => {
    if (formData.activityProviderId) {
      apService
        .getConfigInterfaceUrl(formData.activityProviderId, token())
        .then((url) => {
          setIframeUrl(
            window.location.origin +
              '/config-interface?interfaceUrl=' +
              encodeURIComponent(url),
          );
          setIframeVisible(true);
        })
        .catch(() => handleError('Failed to fetch iframe URL.'));
    } else {
      handleError('Please select an activity provider.');
    }
  };

  const handleAdd = () => {
    apService
      .getActivityParams(formData.activityProviderId, token())
      .then((params) => {
        const iframeWindow = document.getElementById(
          'configInterfaceIframe',
        ) as HTMLIFrameElement;
        let parameters = {};
        for (const param of params) {
          const val = iframeWindow?.contentDocument?.getElementById(
            param,
          ) as HTMLInputElement;

          if (!val) {
            throw new Error(`Missing parameter ${param}`);
          }

          parameters = { ...parameters, [param]: val.value };
        }

        return parameters;
      })
      .then(async (parameters) => {
        const activity = { ...formData, parameters: parameters };
        await activityService.create(activity, token());
        fetchAndMap();
        setFormData({ name: '', activityProviderId: '', parameters: {} });
        handleCloseAdd();
      })
      .catch((e: any) =>
        handleError(`Failed to add the activity: ${e.message}`),
      );
  };

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  const isNextDisabled =
    !formData.name.trim() || !formData.activityProviderId.trim();

  const handleSort = (column: keyof any) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value.toLowerCase());
  };

  const filteredData = activityList.filter(
    (row) =>
      row.name.toLowerCase().includes(filter) ||
      row.ap.toLowerCase().includes(filter) ||
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
                  active={orderBy === 'ap'}
                  direction={order}
                  onClick={() => handleSort('ap')}
                >
                  AP
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
                <TableCell>{row.ap}</TableCell>
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

      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={iframeVisible ? fullWindowStyle : style}>
          <h2 id="modal-modal-title">Add New Activity</h2>
          {!iframeVisible && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <TextField
                select
                fullWidth
                margin="normal"
                label="Activity Provider"
                name="activityProviderId"
                value={formData.activityProviderId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activityProviderId: e.target.value,
                  })
                }
              >
                {apList.map((ap) => (
                  <MenuItem key={ap._id} value={ap._id}>
                    {ap.name}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={isNextDisabled}
                style={{ marginTop: 16 }}
              >
                Next
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseAdd}
                style={{ marginTop: 16, marginLeft: 5 }}
              >
                Cancel
              </Button>
            </>
          )}

          {iframeVisible && (
            <>
              <iframe
                id="configInterfaceIframe"
                src={iframeUrl}
                title="Activity Configuration Interface"
                style={{
                  width: '100%',
                  height: '75%',
                  border: '1px solid #ccc',
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdd}
                style={{ marginTop: 16 }}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseAdd}
                style={{ marginTop: 16, marginLeft: 5 }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={closeDeleteConfirmation}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the activity {deleteTarget?.name}?
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
