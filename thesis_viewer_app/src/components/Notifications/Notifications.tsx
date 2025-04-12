import React, { useState } from "react";
import { 
  Badge, 
  Popover, 
  IconButton, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Button,
  Chip
} from "@mui/material";
import { Bell } from "lucide-react";

// Define a type for notifications
interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationsProps {
  // Optional initial notifications for testing or pre-loading
  initialNotifications?: Notification[];
}

const Notifications: React.FC<NotificationsProps> = ({ 
  initialNotifications = [] 
}) => {
  // State for notification dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Placeholder notifications data
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications.length > 0 ? initialNotifications : [
      {
        id: 1,
        message: "New thesis uploaded by John Doe",
        time: "Just now",
        read: false,
        type: 'info'
      },
      {
        id: 2,
        message: "Your permissions have been updated by admin",
        time: "2 hours ago",
        read: false,
        type: 'success'
      },
      {
        id: 3,
        message: "System maintenance scheduled for tonight",
        time: "Yesterday",
        read: false,
        type: 'warning'
      }
    ]
  );

  const notificationCount = notifications.filter(n => !n.read).length;

  // Handle notification icon click
  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the notification popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Get color based on notification type
  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'info':
        return '#2196f3';
      case 'success':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  return (
    <>
      {/* Notification Icon with Badge */}
      <IconButton 
        onClick={handleNotificationClick}
        aria-describedby="notifications-popover"
      >
        <Badge badgeContent={notificationCount} color="error">
          <Bell size={24} />
        </Badge>
      </IconButton>
      
      {/* Notifications Popover */}
      <Popover
        id="notifications-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
          '& .MuiPopover-paper': {
            width: '350px',
            maxHeight: '400px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #eeeeee',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}
        >
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Notifications
            </Typography>
            {notificationCount > 0 && (
              <Chip 
                label={notificationCount} 
                size="small" 
                color="primary" 
                sx={{ ml: 1, height: '20px', fontSize: '0.75rem' }} 
              />
            )}
          </Box>
          {notificationCount > 0 && (
            <Button 
              size="small" 
              onClick={markAllAsRead}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.75rem',
                color: 'text.secondary'
              }}
            >
              Clear all
            </Button>
          )}
        </Box>
        
        {/* Notification List */}
        {notifications.length === 0 ? (
          <Box 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              color: 'text.secondary',
              backgroundColor: '#fff'
            }}
          >
            <Bell size={32} strokeWidth={1.5} />
            <Typography mt={1}>No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, backgroundColor: '#fff' }}>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem 
                  sx={{ 
                    px: 2,
                    py: 1.5,
                    position: 'relative',
                    opacity: notification.read ? 0.7 : 1,
                    backgroundColor: notification.read ? '#fff' : '#fafafa',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      backgroundColor: notification.read ? 'transparent' : getNotificationColor(notification.type)
                    }
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={notification.read ? 400 : 500}>
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="span"
                      >
                        {notification.time}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider sx={{ margin: 0 }} />}
              </Box>
            ))}
          </List>
        )}
        
        {/* Footer */}
        {notifications.length > 0 && (
          <Box 
            sx={{ 
              p: 1.5, 
              borderTop: '1px solid #eeeeee',
              textAlign: 'center',
              backgroundColor: '#fff'
            }}
          >
            <Button 
              fullWidth
              variant="text"
              size="small" 
              sx={{ 
                textTransform: 'none',
                fontSize: '0.85rem'
              }}
            >
              View all notifications
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default Notifications;