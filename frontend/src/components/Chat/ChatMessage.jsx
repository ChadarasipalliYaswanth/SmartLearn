import React from 'react';
import { Box, Typography, Avatar, Paper, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import { format } from 'date-fns';

// Styled components
const MessageBubble = styled(Paper)(({ theme, isCurrentUser, isBot }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: isCurrentUser ? '20px 20px 0 20px' : '20px 20px 20px 0',
  maxWidth: '85%',
  wordWrap: 'break-word',
  backgroundColor: isBot 
    ? theme.palette.grey[200]
    : isCurrentUser 
      ? theme.palette.primary.main 
      : theme.palette.grey[100],
  color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: isCurrentUser 
    ? '0 2px 6px rgba(0, 0, 0, 0.15)' 
    : '0 1px 3px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  }
}));

const MessageContainer = styled(Box)(({ theme, isCurrentUser }) => ({
  display: 'flex',
  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(0.5, 0),
  animation: 'fadeIn 0.3s ease',
}));

const StyledAvatar = styled(Avatar)(({ theme, isCurrentUser, isBot }) => ({
  width: 32, 
  height: 32,
  backgroundColor: isBot 
    ? theme.palette.grey[400] 
    : isCurrentUser 
      ? theme.palette.primary.dark 
      : theme.palette.secondary.light,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)'
  }
}));

/**
 * Chat message component that displays a single message in the chat
 */
const ChatMessage = ({ message, currentUser, sender }) => {
  const isCurrentUser = sender?._id === currentUser?._id;
  const isBot = sender?.role === 'bot' || message.isBot;
  
  return (
    <MessageContainer isCurrentUser={isCurrentUser}>
      {!isCurrentUser && (
        <Box sx={{ marginRight: 1, display: 'flex', alignItems: 'flex-end' }}>
          <StyledAvatar 
            isBot={isBot}
            alt={sender?.name}
            src={sender?.avatar ? `/uploads/images/${sender?.avatar}` : undefined}
          >
            {sender?.name?.charAt(0) || <PersonIcon fontSize="small" />}
          </StyledAvatar>
        </Box>
      )}
      
      <Box sx={{ maxWidth: '85%' }}>
        {!isCurrentUser && (
          <Typography 
            variant="caption" 
            sx={{ 
              marginLeft: 1, 
              fontWeight: 500,
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}
          >
            {sender?.name || 'User'}
          </Typography>
        )}
        
        <Tooltip 
          title={format(new Date(message.timestamp || message.createdAt), 'MMM d, yyyy h:mm a')}
          placement={isCurrentUser ? 'left' : 'right'}
          arrow
        >
          <MessageBubble isCurrentUser={isCurrentUser} isBot={isBot}>
            <Typography variant="body2">{message.message}</Typography>
          </MessageBubble>
        </Tooltip>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            fontSize: '0.7rem', 
            color: 'text.disabled',
            mt: 0.5,
            ml: isCurrentUser ? 0 : 1,
            mr: isCurrentUser ? 1 : 0,
            textAlign: isCurrentUser ? 'right' : 'left'
          }}
        >
          {format(new Date(message.timestamp || message.createdAt), 'h:mm a')}
        </Typography>
      </Box>
      
      {isCurrentUser && (
        <Box sx={{ marginLeft: 1, display: 'flex', alignItems: 'flex-end' }}>
          <StyledAvatar 
            isCurrentUser={isCurrentUser}
            alt={currentUser?.name}
            src={currentUser?.avatar ? `/uploads/images/${currentUser?.avatar}` : undefined}
          >
            {currentUser?.name?.charAt(0) || <PersonIcon fontSize="small" />}
          </StyledAvatar>
        </Box>
      )}
    </MessageContainer>
  );
};

export default ChatMessage; 