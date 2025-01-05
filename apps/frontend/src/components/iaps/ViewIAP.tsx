import { useSearchParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function ViewIAP() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  return (
    <>
      <Typography
        variant="h5"
        component="div"
        sx={{ mr: 2, textAlign: 'center' }}
      >
        View IAP
      </Typography>
      <p>IAP ID: {id}</p>
    </>
  );
}
