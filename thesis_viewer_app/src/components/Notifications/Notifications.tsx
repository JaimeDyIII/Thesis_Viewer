import React, { useState, useEffect } from "react";
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
  Chip,
  CircularProgress
} from "@mui/material";
import { Bell } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { formatDistanceToNow } from "date-fns";

// Define a type for notifications
interface Notification {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationsProps {
  // Optional initial notifications for testing or pre-loading
  initialNotifications?: Notification[];
}

const Notifications: React.FC<NotificationsProps> = () => {
  // State for notification dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const notificationCount = notifications.filter(n => !n.is_read).length;

  // Fetch the current user ID and notifications
  useEffect(() => {
    const fetchUserAndNotifications = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          setUserId(session.user.id);
          fetchNotifications(session.user.id);
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    };

    fetchUserAndNotifications();
  }, []);

  // Fetch notifications from the database
  const fetchNotifications = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("Notification")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format the time
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Just now";
    }
  };

  // Handle notification icon click
  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the notification popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mark a notification as read
  const markAsRead = async (id: number) => {
    try {
      const { error } = await supabase
        .from("Notification")
        .update({ is_read: true })
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("Notification")
        .update({ is_read: true })
        .eq("user_id", userId);
      
      if (error) {
        throw error;
      }
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Get color based on notification content
  const getNotificationColor = (content: string) => {
    if (content.includes("role") || content.includes("permissions")) {
      return '#4caf50'; // Success/green
    } else if (content.includes("thesis")) {
      return '#2196f3'; // Info/blue
    } else if (content.includes("maintenance") || content.includes("warning")) {
      return '#ff9800'; // Warning/orange
    } else {
      return '#2196f3'; // Default blue
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
        {loading ? (
          <Box 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              color: 'text.secondary',
              backgroundColor: '#fff',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
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
                    opacity: notification.is_read ? 0.7 : 1,
                    backgroundColor: notification.is_read ? '#fff' : '#fafafa',
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
                      backgroundColor: notification.is_read ? 'transparent' : getNotificationColor(notification.content)
                    }
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={notification.is_read ? 400 : 500}>
                        {notification.content}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="span"
                      >
                        {formatTime(notification.created_at)}
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
            
          </Box>
        )}
      </Popover>
    </>
  );
};

export default Notifications;