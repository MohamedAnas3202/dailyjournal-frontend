import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Box,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Chip,
  Fade,
  Zoom,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AlertTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Book as BookIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  PersonRemove as PersonRemoveIcon
} from '@mui/icons-material';
import { getCurrentUser, updateProfile, uploadProfilePicture, getMyFriends, getFriendCount, getJournals, removeFriend, getUserFriends } from '../services/api';
import { getProfilePictureUrl } from '../config/config';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [photoDialog, setPhotoDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    oldPassword: '' 
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [friends, setFriends] = useState([]);
  const [friendCount, setFriendCount] = useState(0);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [journalCount, setJournalCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [privateCount, setPrivateCount] = useState(0);
  const [memberSince, setMemberSince] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [removingFriend, setRemovingFriend] = useState(null);
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState({ open: false, friend: null });
  const [viewFriendsDialog, setViewFriendsDialog] = useState({ open: false, friend: null, friends: [], loading: false });

  // Fetch user only on mount
  useEffect(() => {
    fetchUser();
    fetchFriends();
    fetchJournalCount();
    fetchAdditionalStats();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
      setForm({ 
        name: res.data.name, 
        email: res.data.email, 
        password: '', 
        oldPassword: '' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to load profile', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    setFriendsLoading(true);
    try {
      const [friendsRes, countRes] = await Promise.all([
        getMyFriends(),
        getFriendCount()
      ]);
      setFriends(friendsRes.data);
      setFriendCount(countRes.data.count);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load friends', 
        severity: 'error' 
      });
    } finally {
      setFriendsLoading(false);
    }
  };

  const fetchJournalCount = async () => {
    try {
      const userRes = await getCurrentUser();
      const journalsRes = await getJournals(userRes.data.id);
      setJournalCount(journalsRes.data.length);
    } catch (error) {
      console.error('Error fetching journal count:', error);
      // Don't show error message for journal count as it's not critical
      setJournalCount(0);
    }
  };

  const fetchAdditionalStats = async () => {
    try {
      const userRes = await getCurrentUser();
      const journalsRes = await getJournals(userRes.data.id);
      const journals = journalsRes.data;
      
      // Count published and private journals
      const published = journals.filter(journal => journal.isPublished).length;
      const privateJournals = journals.filter(journal => journal.isPrivate).length;
      
      setPublishedCount(published);
      setPrivateCount(privateJournals);
      
      // Set member since date from user creation date
      if (userRes.data.createdAt) {
        const memberDate = new Date(userRes.data.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short'
        });
        setMemberSince(memberDate);
      } else {
        setMemberSince('Unknown');
      }
    } catch (error) {
      console.error('Error fetching additional stats:', error);
      // Set default values on error
      setPublishedCount(0);
      setPrivateCount(0);
      setMemberSince('Unknown');
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleViewUserJournals = (userId) => {
    navigate(`/user-journals/${userId}`);
  };

  const handleRemoveFriendClick = (friend) => {
    setConfirmRemoveDialog({ open: true, friend });
  };

  const handleViewFriendsClick = async (friend) => {
    setViewFriendsDialog({ open: true, friend, friends: [], loading: true });
    
    try {
      const response = await getUserFriends(friend.id);
      setViewFriendsDialog(prev => ({ 
        ...prev, 
        friends: response.data, 
        loading: false 
      }));
    } catch (error) {
      console.error('Error fetching friend\'s friends:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load friends list',
        severity: 'error'
      });
      setViewFriendsDialog(prev => ({ 
        ...prev, 
        loading: false 
      }));
    }
  };

  const handleCloseViewFriendsDialog = () => {
    setViewFriendsDialog({ open: false, friend: null, friends: [], loading: false });
  };

  const handleConfirmRemoveFriend = async () => {
    const friendToRemove = confirmRemoveDialog.friend;
    if (!friendToRemove) return;

    setRemovingFriend(friendToRemove.id);
    try {
      const response = await removeFriend(friendToRemove.id);
      if (response.data.success) {
        // Remove friend from local state
        setFriends(prevFriends => prevFriends.filter(f => f.id !== friendToRemove.id));
        setFriendCount(prevCount => prevCount - 1);
        
        setSnackbar({
          open: true,
          message: `${friendToRemove.name} has been removed from your friends list.`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to remove friend',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      setSnackbar({
        open: true,
        message: 'Error removing friend. Please try again.',
        severity: 'error'
      });
    } finally {
      setRemovingFriend(null);
      setConfirmRemoveDialog({ open: false, friend: null });
    }
  };

  const handleCancelRemoveFriend = () => {
    setConfirmRemoveDialog({ open: false, friend: null });
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
    friend.email.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const handleEdit = () => {
    setEdit(true);
    setForm(f => ({ ...f, password: '', oldPassword: '' }));
  };

  const handleCancel = () => {
    setEdit(false);
    if (user) {
      setForm({ 
        name: user.name, 
        email: user.email, 
        password: '', 
        oldPassword: '' 
      });
    }
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    
    const updateData = {
      name: form.name,
      email: form.email,
    };
    
    if (form.password && form.password.trim() !== "") {
      updateData.password = form.password;
      updateData.oldPassword = form.oldPassword;
    }
    
    try {
      await updateProfile(updateData);
      setSnackbar({ 
        open: true, 
        message: 'Profile updated successfully!', 
        severity: 'success' 
      });
      await fetchUser();
      setEdit(false);
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: 'Update failed: ' + (err?.response?.data?.message || err?.response?.data || 'Unknown error'), 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async e => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setSnackbar({ 
        open: true, 
        message: 'File size must be less than 5MB', 
        severity: 'error' 
      });
      return;
    }
    
    setLoading(true);
    try {
      await uploadProfilePhoto(file);
      setSnackbar({ 
        open: true, 
        message: 'Profile photo updated successfully!', 
        severity: 'success' 
      });
      await fetchUser();
      setPhotoDialog(false);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Photo upload failed: ' + (error?.response?.data?.message || 'Unknown error'), 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const getJoinDate = () => {
    if (!user?.createdAt) return 'Unknown';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header Section */}
      <Fade in timeout={800}>
        <Paper elevation={8} sx={{ 
          p: 4, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user?.profilePicture ? `https://dailyjournal-backend-4.onrender.com${user.profilePicture}` : undefined}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    fontSize: '3rem',
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                >
                  {getInitials(user?.name)}
                </Avatar>
                <Tooltip title="Change Photo">
                  <IconButton
                    onClick={() => setPhotoDialog(true)}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'white' }
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user?.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                {user?.email}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip 
                  icon={<PersonIcon />} 
                  label={user?.role || 'User'} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  icon={<CalendarIcon />} 
                  label={`Joined ${getJoinDate()}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Stack>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={edit ? <SaveIcon /> : <EditIcon />}
                onClick={edit ? handleUpdate : handleEdit}
                disabled={loading}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                {edit ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Stats Cards */}
      <Zoom in timeout={1000}>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ 
              textAlign: 'center', 
              p: 4,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              borderRadius: 3,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}>
              <BookIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {journalCount}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>
                Journal Entries
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ 
              textAlign: 'center', 
              p: 4,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: 3,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}>
              <StarIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {user?.role === 'ADMIN' ? 'Admin' : 'Member'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>
                Account Status
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ 
              textAlign: 'center', 
              p: 4,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              borderRadius: 3,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}>
              <PeopleIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {friendCount}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>
                Friends
              </Typography>
            </Card>
          </Grid>
          
          {/* Published Journals Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ 
              textAlign: 'center', 
              p: 4,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}>
              <PublicIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {publishedCount}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>
                Published Journals
              </Typography>
            </Card>
          </Grid>
          
          {/* Private Journals Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ 
              textAlign: 'center', 
              p: 4,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: 3,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}>
              <LockIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {privateCount}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>
                Private Journals
              </Typography>
            </Card>
          </Grid>
          
          {/* Member Since Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ 
              textAlign: 'center', 
              p: 4,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: 3,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}>
              <CalendarIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {memberSince}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>
                Member Since
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Zoom>

      {/* Profile Form */}
      <Fade in timeout={1200}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
            Profile Information
          </Typography>
          
          <Box component="form" onSubmit={handleUpdate}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  fullWidth
                  value={form.name}
                  onChange={handleChange}
                  disabled={!edit}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: edit ? '#667eea' : 'transparent',
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  fullWidth
                  value={form.email}
                  onChange={handleChange}
                  disabled={!edit}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: edit ? '#667eea' : 'transparent',
                      },
                    },
                  }}
                />
              </Grid>

              {edit && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }}>
                      <Chip label="Change Password (Optional)" color="primary" />
                    </Divider>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Current Password"
                      name="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      fullWidth
                      value={form.oldPassword}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <SecurityIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            edge="end"
                          >
                            {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="New Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      value={form.password}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <SecurityIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>

            {edit && (
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{
                    bgcolor: '#667eea',
                    '&:hover': { bgcolor: '#5a6fd8' }
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Friends Section */}
      <Fade in timeout={800}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PeopleIcon sx={{ mr: 2, color: '#667eea', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748' }}>
              Friends ({friendCount})
            </Typography>
          </Box>

          {/* Friend Search Input */}
          {friends.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search friends by name or email..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    }
                  }
                }}
              />
            </Box>
          )}

          {friendsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : friends.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                You haven't added any friends yet. Search for users to add them as friends!
              </Typography>
            </Box>
          ) : filteredFriends.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No friends found matching "{friendSearch}". Try a different search term.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredFriends.map((friend) => (
                <Grid item xs={12} sm={6} md={4} key={friend.id}>
                  <Card
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Avatar
                        src={friend.profilePicture ? `https://dailyjournal-backend-4.onrender.com${friend.profilePicture}` : undefined}
                        sx={{ width: 60, height: 60, mx: 'auto', mb: 2 }}
                      >
                        {getInitials(friend.name)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {friend.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {friend.email}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewUserJournals(friend.id)}
                          sx={{
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': {
                              borderColor: '#5a6fd8',
                              backgroundColor: 'rgba(102, 126, 234, 0.04)'
                            }
                          }}
                        >
                          View Journals
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PeopleIcon />}
                          onClick={() => handleViewFriendsClick(friend)}
                          sx={{
                            borderColor: '#ff9800',
                            color: '#ff9800',
                            '&:hover': {
                              borderColor: '#f57c00',
                              backgroundColor: 'rgba(255, 152, 0, 0.04)'
                            }
                          }}
                        >
                          View Friends
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<PersonRemoveIcon />}
                          onClick={() => handleRemoveFriendClick(friend)}
                          disabled={removingFriend === friend.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.04)'
                            }
                          }}
                        >
                          {removingFriend === friend.id ? 'Removing...' : 'Remove Friend'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Fade>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              src={user?.profilePicture ? `https://dailyjournal-backend-4.onrender.com${user.profilePicture}` : undefined}
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
            >
              {getInitials(user?.name)}
            </Avatar>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose a new profile photo. Maximum file size: 5MB
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCameraIcon />}
            >
              Select Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Remove Friend Confirmation Dialog */}
      <Dialog 
        open={confirmRemoveDialog.open} 
        onClose={handleCancelRemoveFriend}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonRemoveIcon color="error" />
          Remove Friend
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to remove <strong>{confirmRemoveDialog.friend?.name}</strong> from your friends list?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action will:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Remove them from your friends list
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Remove you from their friends list
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              You can send them a new friend request later if needed
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelRemoveFriend}
            disabled={removingFriend !== null}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmRemoveFriend}
            color="error"
            variant="contained"
            disabled={removingFriend !== null}
            startIcon={removingFriend !== null ? <CircularProgress size={16} /> : <PersonRemoveIcon />}
          >
            {removingFriend !== null ? 'Removing...' : 'Remove Friend'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Friends Dialog */}
      <Dialog 
        open={viewFriendsDialog.open} 
        onClose={handleCloseViewFriendsDialog}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          {viewFriendsDialog.friend?.name}'s Friends
        </DialogTitle>
        <DialogContent>
          {viewFriendsDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : viewFriendsDialog.friends.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {viewFriendsDialog.friend?.name} has no friends yet
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {viewFriendsDialog.friends.map((friendOfFriend) => (
                <Grid item xs={12} sm={6} md={4} key={friendOfFriend.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Avatar
                        src={friendOfFriend.profilePicture ? `https://dailyjournal-backend-4.onrender.com${friendOfFriend.profilePicture}` : undefined}
                        sx={{ width: 50, height: 50, mx: 'auto', mb: 1 }}
                      >
                        {getInitials(friendOfFriend.name)}
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {friendOfFriend.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {friendOfFriend.email}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            handleCloseViewFriendsDialog();
                            handleViewUserJournals(friendOfFriend.id);
                          }}
                          sx={{
                            borderColor: '#667eea',
                            color: '#667eea',
                            fontSize: '0.75rem',
                            '&:hover': {
                              borderColor: '#5a6fd8',
                              backgroundColor: 'rgba(102, 126, 234, 0.04)'
                            }
                          }}
                        >
                          View Journals
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewFriendsDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <AlertTitle>
            {snackbar.severity === 'success' ? 'Success!' : 'Error!'}
          </AlertTitle>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Profile; 