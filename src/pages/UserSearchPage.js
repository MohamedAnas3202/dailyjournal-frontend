import React from 'react';
import { Container, Typography, Box, Paper, Fade } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import UserSearch from '../components/UserSearch';

const UserSearchPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header Section */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <SearchIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  mb: 2
                }}
              >
                Find Users
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  maxWidth: 600,
                  margin: '0 auto',
                  lineHeight: 1.6
                }}
              >
                Search for users by name or email address. Connect with other journal writers and discover their public content.
              </Typography>
            </Box>

            {/* Search Section */}
            <Paper 
              elevation={24} 
              sx={{ 
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }
              }}
            >
              <UserSearch />
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default UserSearchPage;