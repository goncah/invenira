import { useSearch } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { ObjectivesService } from '../../services/objectives.service';
import { CircularProgress, Divider, Grid2 } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { router } from '../../App';
import { IAPsService } from '../../services/iaps.service';
import { StudentObjectiveKey } from '@invenira/model';
import { FilterableTable } from '@invenira/components';

const objectiveColumns = [
  {
    id: 'inveniraStdID' as StudentObjectiveKey,
    name: 'Invenira User Id',
  },
  {
    id: 'lmsStdID' as StudentObjectiveKey,
    name: 'LMS User Id',
  },
  {
    id: 'targetValue' as StudentObjectiveKey,
    name: 'Target Value',
  },
  {
    id: 'value' as StudentObjectiveKey,
    name: 'Value',
  },
];

export default function ViewObjective() {
  const search = useSearch({ from: '/view-objective' });
  const [objectiveId] = useState<string>(search?.id?.toString() || '');
  const auth = useAuth();

  if (!objectiveId.trim()) {
    throw new Error('Objective ID is required');
  }

  const objectiveService = useMemo(() => {
    return new ObjectivesService();
  }, []);

  const iapService = useMemo(() => {
    return new IAPsService();
  }, []);

  const token = () => {
    return auth?.user?.access_token || '';
  };

  const {
    data: objective,
    isLoading: isObjectiveLoading,
    error: objectiveError,
  } = useQuery({
    queryKey: ['objective', objectiveId],
    queryFn: async () => {
      const objective = await objectiveService.getOne(objectiveId, token());

      if (!objective) {
        throw new Error('Invalid Objective id');
      }

      return objective;
    },
  });

  if (objectiveError) {
    throw objectiveError;
  }

  const {
    data: objectiveDetails,
    isLoading: isObjectiveDetailsLoading,
    error: objectiveDetailsError,
  } = useQuery({
    queryKey: ['objective-details', objectiveId],
    queryFn: async () => {
      const objectiveDetails = await objectiveService.getOneDetails(
        objectiveId,
        token(),
      );

      if (!objectiveDetails) {
        throw new Error('Invalid Objective id');
      }

      return objectiveDetails;
    },
  });

  if (objectiveDetailsError) {
    throw objectiveDetailsError;
  }

  const objectiveDetailRows = objectiveDetails?.map((a) => ({
    row: a,
    actions: [],
  }));

  const {
    data: iap,
    isLoading: isIapLoading,
    error: iapError,
  } = useQuery({
    queryKey: ['iap', objective],
    queryFn: async () => {
      const iap = await iapService.getOne(objective?.iapId || '', token());

      if (!iap) {
        throw new Error('Invalid IAP id');
      }

      if (!iap.isDeployed) {
        router.navigate({ to: '/edit-iap', search: { id: objective?.iapId } });
      }

      return iap;
    },
  });

  if (iapError) {
    throw iapError;
  }

  if (isObjectiveLoading || isIapLoading || isObjectiveDetailsLoading) {
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
          {objective?.name} Objective
        </Typography>
        <Typography component="div" sx={{ mr: 2 }}>
          <p>Objective ID: {iap?._id}</p>
          <p>Objective Formula: {objective?.formula}</p>
          <p>IAP ID: {iap?._id}</p>
          <p>IAP: {iap?.name}</p>
        </Typography>
      </Grid2>
      <Grid2>
        <Divider sx={{ mt: 2 }}>Students:</Divider>

        <FilterableTable
          columns={objectiveColumns}
          sortBy={'inveniraStdID'}
          rows={objectiveDetailRows || []}
        />
      </Grid2>
    </Grid2>
  );
}
