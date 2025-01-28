import * as React from 'react';
import { useMemo, useState } from 'react';
import { IAPsService } from '../../services/iaps.service';
import { useAuth } from 'react-oidc-context';
import { ActivityKey, ObjectiveKey } from '@invenira/model';
import { ActivitiesService } from '../../services/activities.service';
import {
  FilterableTable,
  SmoothDialog,
  SmoothModal,
} from '@invenira/components';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { CircularProgress, Container, Divider, Grid2 } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useError } from '../layout/Layout';
import MenuItem from '@mui/material/MenuItem';
import { router } from '../../App';
import { useSearch } from '@tanstack/react-router';
import { ObjectivesService } from '../../services/objectives.service';

const activityColumns = [
  {
    id: 'name' as ActivityKey,
    name: 'Name',
  },
];

const objectiveColumns = [
  {
    id: 'name' as ObjectiveKey,
    name: 'Name',
  },
  {
    id: 'formula' as ObjectiveKey,
    name: 'Formula',
  },
  {
    id: 'targetValue' as ObjectiveKey,
    name: 'Target Value',
  },
];

export default function EditIAP() {
  const auth = useAuth();
  const [openAdd, setOpenAdd] = useState(false);
  const [openAddObjective, setOpenAddObjective] = useState(false);
  const [activityId, setActivityId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [formula, setFormula] = useState<string>('');
  const [targetValue, setTargetValue] = useState<number>(0);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    name: string;
    type: 'activity' | 'objective';
  } | null>(null);
  const search = useSearch({ from: '/edit-iap' });
  const [iapId] = useState<string>(search?.id || '');
  const { showError } = useError();

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const activityService = useMemo(() => {
    return new ActivitiesService();
  }, []);

  const objectiveService = useMemo(() => {
    return new ObjectivesService();
  }, []);

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

  const queryClient = useQueryClient();

  const {
    data: iaps,
    isLoading: isIapsLoading,
    error: iapsError,
  } = useQuery({
    queryKey: ['iaps'],
    queryFn: async () => {
      return iapService.getAll(token());
    },
  });

  if (iapsError) {
    throw iapsError;
  }

  const {
    data: iap,
    isLoading: isIapLoading,
    error: iapError,
  } = useQuery({
    queryKey: ['iap', iapId],
    queryFn: async () => {
      const iap = await iapService.getOne(iapId, token());

      if (!iap) {
        throw new Error('Invalid IAP id');
      }

      if (iap.isDeployed) {
        router.navigate({ to: '/view-iap', search: { id: iapId } });
      }

      return iap;
    },
  });

  if (iapError) {
    throw iapError;
  }

  const {
    data: iapMetrics,
    isLoading: isIapMetricsLoading,
    error: iapMetricsError,
  } = useQuery({
    queryKey: ['iap-metrics', iapId],
    queryFn: async () => iapService.getMetrics(iapId, token()),
  });

  if (iapMetricsError) {
    throw iapMetricsError;
  }

  const {
    data: activityList,
    isLoading: isActivitiesLoading,
    error: atError,
  } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => activityService.getAll(token()),
  });

  if (atError) {
    throw atError;
  }

  const {
    data: objectiveList,
    isLoading: isObjectivesLoading,
    error: objectiveError,
  } = useQuery({
    queryKey: ['objectives', iapId],
    queryFn: async () => objectiveService.getAll(token()),
  });

  if (objectiveError) {
    throw objectiveError;
  }

  const addActivityMutation = useMutation({
    mutationFn: async () => {
      await iapService.addActivity(iap?._id || '', activityId, token());
    },

    onSuccess: () => {
      queryClient
        .invalidateQueries()
        .then(() => setActivityId(''))
        .then(() => setOpenAdd(false));
    },
    onError: () => {
      showError('Failed to add the activity.');
    },
  });

  const removeActivityMutation = useMutation({
    mutationFn: async () => {
      await iapService.removeActivity(
        iap?._id || '',
        removeTarget?.id || '',
        token(),
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries().then(() => closeRemoveConfirmation());
    },
    onError: () => {
      showError('Failed to remove the activity.');
    },
  });

  const removeObjectiveMutation = useMutation({
    mutationFn: async () => {
      await objectiveService.delete(removeTarget?.id || '', token());
    },

    onSuccess: () => {
      queryClient.invalidateQueries().then(() => closeRemoveConfirmation());
    },
    onError: () => {
      showError('Failed to remove the objective.');
    },
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      await iapService.deploy(iap?._id || '', token());
    },

    onSuccess: () => {
      router.navigate({ to: '/view-iap', search: { id: iap?._id } });
    },
    onError: () => {
      showError('Failed to deploy IAP.');
    },
  });

  const addObjectiveMutation = useMutation({
    mutationFn: async () => {
      const obj = {
        name,
        iapId: iap?._id || '',
        formula,
        targetValue,
      };

      await objectiveService.create(obj, token());
    },

    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['objectives'] })
        .then(() => setOpenAddObjective(false))
        .then(() => setName(''))
        .then(() => setFormula(''))
        .then(() => setTargetValue(0));
    },
    onError: () => {
      showError('Failed to add the objective.');
    },
  });

  const mutations = {
    add: () => addActivityMutation.mutate(),
    remove: () =>
      removeTarget?.type === 'activity'
        ? removeActivityMutation.mutate()
        : removeObjectiveMutation.mutate(),
    deploy: () => deployMutation.mutate(),
    addObjective: () => addObjectiveMutation.mutate(),
  };

  const openRemoveConfirmation = (
    id: string,
    name: string,
    type: 'activity' | 'objective',
  ) => {
    setRemoveTarget({ id, name, type });
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

  const isAddDisabled = !activityId.trim();

  const iapActivities = activityList
    ?.filter((a) => iap?.activityIds?.includes(a._id))
    .map((a, idx) => ({
      row: a,
      actions: [
        <Button
          key={`btn-${a._id}-${idx}`}
          variant="outlined"
          color="secondary"
          onClick={() => openRemoveConfirmation(a._id, a.name, 'activity')}
          sx={{ marginLeft: 1 }}
        >
          Remove
        </Button>,
      ],
    }));

  const iapObjectives = objectiveList
    ?.filter((o) => o.iapId === iapId)
    .map((a, idx) => ({
      row: a,
      actions: [
        <Button
          key={`btn-${a._id}-${idx}`}
          variant="outlined"
          color="secondary"
          onClick={() => openRemoveConfirmation(a._id, a.name, 'objective')}
          sx={{ marginLeft: 1 }}
        >
          Remove
        </Button>,
      ],
    }));

  const availableActivities = activityList?.filter(
    (a) => !iaps?.find((i) => i?.activityIds?.includes(a._id)),
  );

  const handleOpenAddObjective = () => setOpenAddObjective(true);

  const handleCancelAddObjective = () => {
    setOpenAddObjective(false);
    setFormula('');
    setName('');
    setTargetValue(0);
  };

  const handleFormulaChange = (value: string) => {
    setFormula((prev) => `${prev} ${value}`.trim());
  };

  if (
    isIapsLoading ||
    isIapLoading ||
    isIapMetricsLoading ||
    isActivitiesLoading ||
    isObjectivesLoading
  ) {
    return <CircularProgress />;
  }

  return (
    <Grid2>
      <Grid2>
        <Typography
          variant="h5"
          component="div"
          sx={{ mr: 2, textAlign: 'center' }}
        >
          Edit {iap?.name} IAP
        </Typography>
        <Typography component="div" sx={{ mr: 2 }}>
          <p>IAP ID: {iap?._id}</p>
          <p>IAP Description: {iap?.description}</p>
          <p>Deployed: {iap?.isDeployed ? 'Yes' : 'No'}</p>
        </Typography>
        <Container
          sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button
            disabled={iap?.activityIds?.length === 0}
            variant="contained"
            color="primary"
            onClick={mutations.deploy}
          >
            Deploy
          </Button>
        </Container>
        <Divider>Activities:</Divider>
        <FilterableTable
          columns={activityColumns}
          sortBy={'name'}
          rows={iapActivities || []}
        />

        <Container
          sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            Add
          </Button>
        </Container>
      </Grid2>
      <Grid2>
        <Divider>Objectives:</Divider>

        <FilterableTable
          columns={objectiveColumns}
          sortBy={'name'}
          rows={iapObjectives || []}
        />

        <Container
          sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button
            variant="contained"
            color="primary"
            disabled={iap?.activityIds?.length === 0}
            onClick={handleOpenAddObjective}
          >
            Add
          </Button>
        </Container>
      </Grid2>
      <SmoothModal open={openAdd} onClose={handleCloseAdd} fullscreen={openAdd}>
        <Box sx={style}>
          <h2 id="modal-modal-title">Add Activity to IAP</h2>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Activity"
            name="activityId"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
          >
            {availableActivities?.map((ap) => (
              <MenuItem key={ap._id} value={ap._id}>
                {ap.name}
              </MenuItem>
            ))}
          </TextField>
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

      <SmoothModal
        open={openAddObjective}
        onClose={handleCancelAddObjective}
        fullscreen={false}
      >
        <Box sx={style}>
          <h2>Add Objective</h2>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Formula"
            fullWidth
            margin="normal"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
          />
          <TextField
            label="Target Value"
            fullWidth
            margin="normal"
            slotProps={{
              htmlInput: {
                inputMode: 'numeric',
                pattern: '[0-9]*',
              },
            }}
            value={targetValue}
            onChange={(e) => setTargetValue(Number(e.target.value))}
          />
          <TextField
            select
            fullWidth
            margin="normal"
            label="Select Metrics"
            value={''}
            onChange={(e) => handleFormulaChange(e.target.value)}
          >
            {iapMetrics?.map((metric: string, idx) => (
              <MenuItem key={'metric_' + idx} value={metric}>
                {metric}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={mutations.addObjective}
            style={{ marginTop: 16 }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelAddObjective}
            style={{ marginTop: 16, marginLeft: 5 }}
          >
            Cancel
          </Button>
        </Box>
      </SmoothModal>

      <SmoothDialog
        title={'Remove Confirmation'}
        content={`Are you sure you want to remove the ${removeTarget?.type === 'activity' ? 'activity' : 'objective'} ${removeTarget?.name}?`}
        open={confirmRemove}
        onClose={closeRemoveConfirmation}
        onConfirm={mutations.remove}
        onCancel={() => setConfirmRemove(false)}
      />
    </Grid2>
  );
}
