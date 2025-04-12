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
import { Bell, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

// Define a type for notifications
interface Notification {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationsProps {
  initialNotifications?: Notification[];
}

const Notifications: React.FC<NotificationsProps> = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const navigate = useNavigate();
  const notificationCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const fetchUserAndNotifications = async () => {
      try {
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

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const fetchNotifications = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("Notification")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Notification",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [
              payload.new as Notification,
              ...prev,
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((notification) =>
                notification.id === payload.new.id
                  ? (payload.new as Notification)
                  : notification
              )
            );
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) =>
              prev.filter((notification) => notification.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy, h:mm a");
    } catch (error) {
      return "Unknown time";
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (id: number) => {
    try {
      const { error } = await supabase
        .from("Notification")
        .update({ is_read: true })
        .eq("id", id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from("Notification")
        .update({ is_read: true })
        .eq("user_id", userId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const { error } = await supabase
        .from("Notification")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from("Notification")
        .delete()
        .eq("user_id", userId);
      
      if (error) throw error;
  
      // ✅ Clear the notifications from local state too
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };
  

  const getNotificationColor = (content: string) => {
    if (content.includes("role") || content.includes("permissions")) return '#4caf50';
    if (content.includes("thesis")) return '#2196f3';
    if (content.includes("maintenance") || content.includes("warning")) return '#ff9800';
    return '#2196f3';
  };

  const handleContainerClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.content.toLowerCase().includes("thesis")) {
      navigate("/manage-thesis");
      handleClose();
    }
  };

  return (
    <>
      <IconButton 
        onClick={handleNotificationClick}
        aria-describedby="notifications-popover"
      >
        <Badge badgeContent={notificationCount} color="error">
          <Bell size={24} />
        </Badge>
      </IconButton>
      
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
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #eeeeee',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexShrink: 0
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
            <IconButton
              size="small"
              onClick={markAllAsRead}
              sx={{
                color: '#4caf50',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                },
              }}
              title="Mark all as read"
            >
              <Check size={18} />
            </IconButton>
          )}
        </Box>
        
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#fff',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            }
          }}
        >
          {loading ? (
            <Box 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                color: 'text.secondary',
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
                color: 'text.secondary'
              }}
            >
              <Bell size={32} strokeWidth={1.5} />
              <Typography mt={1}>No notifications</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
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
                      },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onClick={() => handleContainerClick(notification)}
                  >
                    <Box sx={{ flex: 1 }}>
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
                    </Box>
                    {(notification.content.toLowerCase().includes("role") || 
                      notification.content.toLowerCase().includes("permissions")) && (
                      <IconButton
                        size="small"
                        onClick={(event) => deleteNotification(notification.id, event)}
                        sx={{
                          ml: 1,
                          color: '#4caf50',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                          },
                        }}
                      >
                        <Check size={18} />
                      </IconButton>
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && <Divider sx={{ margin: 0 }} />}
                </Box>
              ))}
            </List>
          )}
        </Box>
        
        {notifications.length > 0 && (
          <Box 
            sx={{ 
              p: 1.5, 
              borderTop: '1px solid #eeeeee',
              textAlign: 'center',
              backgroundColor: '#fff',
              flexShrink: 0
            }}
          >
            <Button
              size="small"
              onClick={clearAllNotifications}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                color: 'text.secondary',
                '&:hover': {
                  color: '#d32f2f',
                },
              }}
            >
              Clear all notifications
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default Notifications;