import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Stack,
  Box,
  Container,
  Fade,
  Zoom,
  Avatar,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  CalendarToday as CalendarTodayIcon,
  LocalOffer as TagIcon,
  InsertEmoticon as MoodIcon,
  Public as PublicIcon,
  Clear as ClearIcon,
  Photo as PhotoIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  InsertDriveFile as DocumentIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import JournalViewer from '../components/JournalViewer';
import { getAllPublishedJournals, searchPublishedJournals } from '../services/api';

function PublishedJournals() {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState([]);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewingJournal, setViewingJournal] = useState(null);
  const [filterMood, setFilterMood] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [fileViewer, setFileViewer] = useState({ open: false, files: [], currentIndex: 0 });
  const [mediaPlayer, setMediaPlayer] = useState({ playing: false, volume: 0.7 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const moods = ['happy', 'sad', 'excited', 'calm', 'anxious', 'grateful', 'frustrated', 'inspired'];

  useEffect(() => {
    if (!token) return;
    fetchPublishedJournals();
  }, [token]);

  // Apply sorting when sortBy changes
  useEffect(() => {
    if (journals.length > 0) {
      let sortedJournals = [...journals];
      
      if (sortBy === 'title') {
        sortedJournals = sortedJournals.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'author') {
        sortedJournals = sortedJournals.sort((a, b) => {
          const authorA = a.userName || a.user?.name || 'Anonymous';
          const authorB = b.userName || b.user?.name || 'Anonymous';
          return authorA.localeCompare(authorB);
        });
      } else {
        // Default sort by date (newest first)
        sortedJournals = sortedJournals.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      
      setJournals(sortedJournals);
    }
  }, [sortBy]);

  const fetchPublishedJournals = async () => {
    setLoading(true);
    try {
      const response = await getAllPublishedJournals();
      setJournals(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load published journals', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (moodFilter) params.mood = moodFilter;
      if (filterTags.trim()) params.tags = filterTags.trim();
      
      const response = await searchPublishedJournals(params);
      let results = response.data;
      
      // Apply client-side sorting
      if (sortBy === 'title') {
        results = results.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'author') {
        results = results.sort((a, b) => {
          const authorA = a.userName || a.user?.name || 'Anonymous';
          const authorB = b.userName || b.user?.name || 'Anonymous';
          return authorA.localeCompare(authorB);
        });
      } else {
        // Default sort by date (newest first)
        results = results.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      
      setJournals(results);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to search published journals', severity: 'error' });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterMood('');
    setMoodFilter('');
    setFilterTags('');
    setSortBy('date');
    fetchPublishedJournals();
  };

  const handleViewJournal = (journal) => {
    setViewingJournal(journal);
  };

  const handleCloseViewer = () => {
    setViewingJournal(null);
  };

  // File viewer handlers
  const handleOpenFileViewer = (files, startIndex = 0) => {
    setFileViewer({ open: true, files, currentIndex: startIndex });
  };

  const handleCloseFileViewer = () => {
    setFileViewer({ open: false, files: [], currentIndex: 0 });
    setMediaPlayer({ playing: false, volume: 0.7 });
  };

  const handleNextFile = () => {
    setFileViewer(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.files.length
    }));
  };

  const handlePrevFile = () => {
    setFileViewer(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.files.length - 1 : prev.currentIndex - 1
    }));
  };

  const handleTogglePlay = () => {
    setMediaPlayer(prev => ({ ...prev, playing: !prev.playing }));
  };

  const handleVolumeChange = (event, newValue) => {
    setMediaPlayer(prev => ({ ...prev, volume: newValue }));
  };

  // File utility functions
  const getFileIcon = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return <PhotoIcon />;
    if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) return <VideoIcon />;
    if (['mp3', 'wav', 'ogg'].includes(extension)) return <AudioIcon />;
    return <DocumentIcon />;
  };

  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
    return 'document';
  };

  const getFullFileUrl = (url) => {
    // If the URL already starts with http, return as is
    if (url.startsWith('http')) {
      return url;
    }
    // If it starts with /api/journals/media/, add the backend base URL
    if (url.startsWith('/api/journals/media/')) {
      return `http://localhost:8080${url}`;
    }
    // If it's just a filename, construct the full URL
    if (!url.startsWith('/')) {
      return `http://localhost:8080/api/journals/media/${url}`;
    }
    // For other cases, add the backend base URL
    return `http://localhost:8080${url}`;
  };

  const handleDownloadFile = async (url) => {
    try {
      const fullUrl = getFullFileUrl(url);
      const filename = url.split('/').pop();
      
      // Fetch the file as a blob to ensure proper download
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      setSnackbar({ open: true, message: 'File downloaded successfully', severity: 'success' });
    } catch (error) {
      console.error('Download error:', error);
      setSnackbar({ open: true, message: 'Failed to download file', severity: 'error' });
    }
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#4caf50',
      sad: '#2196f3',
      excited: '#ff9800',
      calm: '#9c27b0',
      anxious: '#f44336',
      grateful: '#795548',
      frustrated: '#e91e63',
      inspired: '#00bcd4'
    };
    return colors[mood?.toLowerCase()] || '#757575';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Enhanced Header Section */}
      <Fade in timeout={800}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <PublicIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Published Journals
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Discover and read journals shared by our community
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Enhanced Search and Filters */}
      <Fade in timeout={1000}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 4, 
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: (theme) => theme.shadows[4]
            }
          }}
        >
          <form onSubmit={handleSearch}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search journals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main'
                        }
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Mood</InputLabel>
                  <Select
                    value={moodFilter}
                    label="Filter by Mood"
                    onChange={(e) => setMoodFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main'
                        }
                      }
                    }}
                  >
                    <MenuItem value="">All Moods</MenuItem>
                    <MenuItem value="happy">😊 Happy</MenuItem>
                    <MenuItem value="sad">😢 Sad</MenuItem>
                    <MenuItem value="excited">🎉 Excited</MenuItem>
                    <MenuItem value="calm">😌 Calm</MenuItem>
                    <MenuItem value="anxious">😰 Anxious</MenuItem>
                    <MenuItem value="grateful">🙏 Grateful</MenuItem>
                    <MenuItem value="frustrated">😤 Frustrated</MenuItem>
                    <MenuItem value="inspired">✨ Inspired</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort by"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main'
                        }
                      }
                    }}
                  >
                    <MenuItem value="date">📅 Date</MenuItem>
                    <MenuItem value="title">📝 Title</MenuItem>
                    <MenuItem value="author">👤 Author</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    height: '56px',
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 10px 4px rgba(102, 126, 234, .3)'
                    }
                  }}
                >
                  <SearchIcon sx={{ mr: 1 }} />
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Fade>

      {/* Enhanced Results Section */}
      {journals.length === 0 ? (
        <Fade in timeout={600}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <PublicIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              No Published Journals Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              Try adjusting your search criteria or check back later for new published journals from our community.
            </Typography>
          </Paper>
        </Fade>
      ) : (
        <Fade in timeout={600}>
          <Grid container spacing={3}>
            {journals.map((journal, index) => (
              <Grid item xs={12} sm={6} lg={4} key={journal.id}>
                <Fade in timeout={300 + index * 100}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${getMoodColor(journal.mood)} 0%, ${getMoodColor(journal.mood)}88 100%)`,
                        zIndex: 1
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        '&::after': {
                          opacity: 1
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                        zIndex: 0
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 1 }}>
                      {/* Enhanced Header with Author */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getMoodColor(journal.mood),
                            mr: 2,
                            width: 48,
                            height: 48,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 700,
                              color: 'text.primary',
                              mb: 0.5
                            }}
                          >
                            {journal.userName || journal.user?.name || 'Anonymous'}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: 'text.secondary',
                              fontWeight: 500
                            }}
                          >
                            <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {formatDate(journal.date)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Enhanced Title */}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'text.primary',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                          minHeight: '3.5rem'
                        }}
                      >
                        {journal.title}
                      </Typography>

                      {/* Enhanced Content Preview */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 3,
                          minHeight: '4.5rem'
                        }}
                      >
                        {journal.content}
                      </Typography>

                      {/* Enhanced Mood and Tags */}
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                          <Chip
                            label={journal.mood || 'No mood'}
                            size="small"
                            sx={{
                              bgcolor: getMoodColor(journal.mood),
                              color: 'white',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                          {journal.tags && journal.tags.split(',').slice(0, 2).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag.trim()}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: getMoodColor(journal.mood),
                                color: getMoodColor(journal.mood),
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: getMoodColor(journal.mood),
                                  color: 'white',
                                  transform: 'scale(1.05)'
                                }
                              }}
                            />
                          ))}
                          {journal.tags && journal.tags.split(',').length > 2 && (
                            <Chip
                              label={`+${journal.tags.split(',').length - 2} more`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(0,0,0,0.08)',
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </CardContent>

                    {/* Enhanced Card Actions */}
                    <CardActions sx={{ p: 3, pt: 0, position: 'relative', zIndex: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewJournal(journal)}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          background: `linear-gradient(45deg, ${getMoodColor(journal.mood)} 30%, ${getMoodColor(journal.mood)}CC 90%)`,
                          boxShadow: `0 4px 12px ${getMoodColor(journal.mood)}40`,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: `linear-gradient(45deg, ${getMoodColor(journal.mood)}DD 30%, ${getMoodColor(journal.mood)}AA 90%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 20px ${getMoodColor(journal.mood)}50`
                          }
                        }}
                      >
                        Read Journal
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {/* File Viewer */}
      <Dialog
        open={fileViewer.open}
        onClose={handleCloseFileViewer}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'background.paper',
            minHeight: '60vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            File Preview ({fileViewer.currentIndex + 1} of {fileViewer.files.length})
          </Typography>
          <Box>
            <Button
              onClick={() => handleDownloadFile(fileViewer.files[fileViewer.currentIndex])}
              startIcon={<DocumentIcon />}
              sx={{ mr: 1 }}
            >
              Download
            </Button>
            <Button onClick={handleCloseFileViewer}>Close</Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          {fileViewer.files.length > 0 && (() => {
            const currentFile = fileViewer.files[fileViewer.currentIndex];
            const fileType = getFileType(currentFile);
            const fullUrl = getFullFileUrl(currentFile);

            if (fileType === 'image') {
              return (
                <Box sx={{ textAlign: 'center', maxWidth: '100%', maxHeight: '70vh' }}>
                  <img
                    src={fullUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    color="error" 
                    sx={{ display: 'none', mt: 2 }}
                  >
                    Failed to load image
                  </Typography>
                </Box>
              );
            } else if (fileType === 'video') {
              return (
                <Box sx={{ textAlign: 'center', maxWidth: '100%' }}>
                  <video
                    controls
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  >
                    <source src={fullUrl} />
                    Your browser does not support the video tag.
                  </video>
                  <Typography 
                    variant="body2" 
                    color="error" 
                    sx={{ display: 'none', mt: 2 }}
                  >
                    Failed to load video
                  </Typography>
                </Box>
              );
            } else if (fileType === 'audio') {
              return (
                <Box sx={{ textAlign: 'center', width: '100%', mt: 4 }}>
                  <AudioIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <audio
                    controls
                    style={{ width: '100%', maxWidth: '500px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  >
                    <source src={fullUrl} />
                    Your browser does not support the audio tag.
                  </audio>
                  <Typography 
                    variant="body2" 
                    color="error" 
                    sx={{ display: 'none', mt: 2 }}
                  >
                    Failed to load audio
                  </Typography>
                </Box>
              );
            } else {
              return (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <DocumentIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {currentFile.split('/').pop()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    This file type cannot be previewed. Click Download to view it.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleDownloadFile(currentFile)}
                    startIcon={<DocumentIcon />}
                    sx={{ mt: 2 }}
                  >
                    Download File
                  </Button>
                </Box>
              );
            }
          })()}
        </DialogContent>
        {fileViewer.files.length > 1 && (
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button onClick={handlePrevFile} disabled={fileViewer.files.length <= 1}>
              Previous
            </Button>
            <Typography variant="body2" sx={{ mx: 2 }}>
              {fileViewer.currentIndex + 1} of {fileViewer.files.length}
            </Typography>
            <Button onClick={handleNextFile} disabled={fileViewer.files.length <= 1}>
              Next
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Journal Viewer */}
      {viewingJournal && (
        <JournalViewer
          open={Boolean(viewingJournal)}
          onClose={handleCloseViewer}
          entry={viewingJournal}
          readOnly={true}
          onOpenFileViewer={handleOpenFileViewer}
          onDownloadFile={handleDownloadFile}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default PublishedJournals;
