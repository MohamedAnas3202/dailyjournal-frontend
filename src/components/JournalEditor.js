import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  Chip, 
  Stack, 
  FormControlLabel, 
  Switch,
  Typography,
  Tooltip
} from '@mui/material';
import { Lock as LockIcon, Public as PublicIcon } from '@mui/icons-material';

function JournalEditor({ open, onClose, onSave, initialData, readOnly }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [mood, setMood] = useState(initialData?.mood || '');
  const [tags, setTags] = useState(initialData?.tags ? (Array.isArray(initialData.tags) ? initialData.tags : initialData.tags.split(',')) : []);
  const [tagInput, setTagInput] = useState('');
  const [date, setDate] = useState(initialData?.date ? initialData.date : new Date().toISOString().slice(0, 10));
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate || false);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setContent(initialData?.content || '');
    setMood(initialData?.mood || '');
    setTags(initialData?.tags ? (Array.isArray(initialData.tags) ? initialData.tags : initialData.tags.split(',')) : []);
    setDate(initialData?.date ? initialData.date : new Date().toISOString().slice(0, 10));
    setIsPrivate(initialData?.isPrivate || false);
  }, [initialData, open]);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };
  const handleSave = () => {
    onSave({
      title,
      content,
      mood,
      tags: tags.join(','),
      date,
      isPrivate,
      mediaPaths: [] // Not implemented yet
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{readOnly ? 'View Entry' : (initialData ? 'Edit Entry' : 'New Entry')}</DialogTitle>
      <DialogContent>
        <TextField label="Title" fullWidth margin="normal" value={title} onChange={e => setTitle(e.target.value)} required disabled={readOnly} />
        <TextField label="Content" fullWidth margin="normal" multiline minRows={4} value={content} onChange={e => setContent(e.target.value)} required disabled={readOnly} />
        <TextField label="Mood" fullWidth margin="normal" value={mood} onChange={e => setMood(e.target.value)} disabled={readOnly} />
        <TextField label="Date" type="date" fullWidth margin="normal" value={date} onChange={e => setDate(e.target.value)} required InputLabelProps={{ shrink: true }} disabled={readOnly} />
        
        {!readOnly && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Tooltip title={isPrivate ? "Only you can see this journal" : "Anyone can see this journal"}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isPrivate ? <LockIcon sx={{ mr: 1 }} /> : <PublicIcon sx={{ mr: 1 }} />}
                    <Typography>{isPrivate ? 'Private' : 'Public'}</Typography>
                  </Box>
                }
                labelPlacement="start"
                sx={{ ml: 0, mr: 2 }}
              />
            </Tooltip>
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          <TextField label="Add Tag" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} disabled={readOnly} />
          {!readOnly && <Button onClick={handleAddTag} sx={{ ml: 1 }}>Add</Button>}
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {tags.map(tag => (
            <Chip key={tag} label={tag} onDelete={readOnly ? undefined : () => handleDeleteTag(tag)} />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
        {!readOnly && <Button onClick={handleSave} variant="contained">Save</Button>}
      </DialogActions>
    </Dialog>
  );
}

export default JournalEditor; 