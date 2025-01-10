import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Box,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Button from '@mui/material/Button';

export function SmoothDialog({
  title,
  content,
  open,
  onConfirm,
  onCancel,
}: {
  title: string;
  content: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const bodyBackgroundColor = getComputedStyle(document.body).backgroundColor;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(2px)',
              zIndex: 10,
            }}
            key="modal-backdrop"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: 20,
              willChange: 'transform',
            }}
            variants={{
              hidden: { opacity: 0, scale: 0.9, x: '-50%', y: '-50%' },
              visible: { opacity: 1, scale: 1, x: '-50%', y: '-50%' },
              exit: { opacity: 0, scale: 0.9, x: '-50%', y: '-50%' },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Box
              style={{
                width: '90%',
                maxWidth: '500px',
                backgroundColor: bodyBackgroundColor,
                borderRadius: '8px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <DialogTitle>{title}</DialogTitle>
              <DialogContent>
                <DialogContentText>{content}</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={onCancel} color="primary">
                  Cancel
                </Button>
                <Button onClick={onConfirm} color="error">
                  Delete
                </Button>
              </DialogActions>
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
