import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, IconButton, Box, Typography } from '@mui/material';
import { Close, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { getMediaUrl } from '../services/api';

const MediaViewer = ({ open, onClose, mediaUrl, mediaUrls = [], onNext, onPrev }) => {
  // Check if the current file is a PDF
  const isPdf = mediaUrl?.toLowerCase().endsWith('.pdf');
  
  // Check if the current file is an image
  const isImage = mediaUrl?.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) !== null;
  
  // Use centralized function
  const getFullMediaUrl = getMediaUrl;
  
  // Helper function to download files as blobs
  const downloadFile = (url) => {
    // Get the filename from the URL
    const filename = url.split('/').pop();
    // Use fetch API to get the file as a blob
    fetch(getFullMediaUrl(url), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(response => response.blob())
    .then(blob => {
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      // Clean up
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    });
  };
  
  const fullMediaUrl = getFullMediaUrl(mediaUrl);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogContent sx={{ position: 'relative', p: 0, height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.3)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
        >
          <Close />
        </IconButton>
        
        {mediaUrls.length > 1 && (
          <>
            <IconButton
              onClick={onPrev}
              sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.3)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
            >
              <NavigateBefore />
            </IconButton>
            <IconButton
              onClick={onNext}
              sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.3)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
            >
              <NavigateNext />
            </IconButton>
          </>
        )}
        
        {isPdf ? (
          <Box sx={{ height: '100%', overflow: 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="h6">PDF Preview</Typography>
              <Typography variant="body2" color="text.secondary">
                PDF preview is not available directly. Please use one of the options below:
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                href={fullMediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Open PDF in New Tab
              </Button>
              <Button 
                variant="outlined"
                onClick={() => downloadFile(mediaUrl)}
              >
                Download PDF
              </Button>
            </Box>
          </Box>
        ) : isImage ? (
          <img 
            src={fullMediaUrl} 
            alt="Media preview" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            This file type cannot be previewed. Please download the file to view it.
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained"
                onClick={() => downloadFile(mediaUrl)}
              >
                Download File
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewer;