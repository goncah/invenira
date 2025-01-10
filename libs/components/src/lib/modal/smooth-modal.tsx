import React, { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from '@mui/material';

export function SmoothModal({
  children,
  open,
  fullscreen,
  onClose,
}: {
  children: ReactNode;
  open: boolean;
  fullscreen: boolean;
  onClose: () => void;
}) {
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
          <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            slotProps={{ backdrop: { style: { background: 'none' } } }}
          >
            <motion.div
              style={
                !fullscreen
                  ? {
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      zIndex: 20,
                      willChange: 'transform',
                    }
                  : {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      willChange: 'transform',
                    }
              }
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.9 },
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {children}
            </motion.div>
          </Modal>
        </>
      )}
    </AnimatePresence>
  );
}
