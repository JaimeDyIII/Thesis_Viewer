import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  Box,
  IconButton,
  Collapse,
  Snackbar,
  Button,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Typography,
  Avatar,
} from "@mui/material";
import { Search, ChevronDown, ChevronUp, UserPlus, FileText } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Header } from "../components/Global/Header";
import CheckLogs from "../components/Global/CheckLogs";
import UserPermissions from "../components/UserManagement/UserPermissions";
import { useAuth } from "../context/AuthContext";
import { addLogEntry, Subsystem, ActionType } from "../components/Global/CheckLogs";
import AddUserDialog from "../components/UserManagement/AddUserDialog";
import "../styles/Manage.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  avatar_url?: string;
}

interface UserAddedData {
  message: string;
  newUser: User;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("Changes saved successfully ✅");
  const [logsOpen, setLogsOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { session, profile } = useAuth();
  const [addUserDialogOpen, setAddUserDialogOpen] = useState<boolean>(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (users.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: authUsers, error } = await supabase.auth.admin.listUsers();
        
        if (error || !authUsers) {
          console.error("Error fetching auth users:", error);
          return;
        }

        const profileMap: Record<string, string> = {};
        
        const currentUserMeta = session.user.user_metadata;
        if (currentUserMeta?.avatar_url) {
          profileMap[session.user.id] = currentUserMeta.avatar_url;
        }
        
        authUsers.users.forEach(authUser => {
          if (authUser.user_metadata?.avatar_url) {
            profileMap[authUser.id] = authUser.user_metadata.avatar_url;
          }
        });
        
        setUserProfiles(profileMap);
      }
    };

    fetchUserProfiles();
  }, [users]);

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    
    try {
      if(!profile) return console.error('User not found');
      
      let query;
      const userRole = profile.role;

      if(userRole === 'Admin'){
        query = supabase.from("users")
          .select("id, name, email, role")
          .or(`role.eq.User, id.eq.${profile.id}`);
      } else if (userRole === 'SuperAdmin') { 
        query = supabase.from("users").select("id, name, email, role");
      } else {
        return console.error('User is not permitted to fetch and manage users');
      }
      
      if (selectedRole) {
        query = query.eq("role", selectedRole);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data || []);
        
        if (data && data.length > 0) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          const profiles: Record<string, string> = {};
          
          if (session.user.user_metadata?.avatar_url) {
            profiles[session.user.id] = session.user.user_metadata.avatar_url;
          }
          
          setUserProfiles(profiles);
        }
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (): void => {
    setSnackbarOpen(false);
  };

  const handleRowClick = (userId: string): void => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const handlePermissionUpdate = (message: string): void => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleRoleChange = async (userId: string, userName: string, newRole: string): Promise<void> => {
    try {
      const oldRole = users.find(u => u.id === userId)?.role || "none";
      
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        console.error("Error updating role:", error);
        handlePermissionUpdate(`Failed to update user role: ${error.message}. Please try again.`);
        return;
      }

      const defaultPermissions: Record<string, Record<string, string[]>> = {
        "Admin": {
          "ThesisRepository": ["view", "add", "edit", "delete"],
          "UserManagement": ["view", "add", "edit", "delete"]
        },
        "Librarian": {
          "ThesisRepository": ["view", "add", "delete"],
          "UserManagement": ["view"]
        },
        "User": {
          "ThesisRepository": ["view"],
          "UserManagement": []
        }
      };

      const permissions = defaultPermissions[newRole];
      
      for (const [subsystem, actions] of Object.entries(permissions)) {
        await supabase
          .from("user_permissions")
          .delete()
          .eq("user_id", userId)
          .eq("subsystem", subsystem);
        
        for (const action of actions) {
          await supabase
            .from("user_permissions")
            .insert({
              user_id: userId,
              subsystem: subsystem,
              action: action,
              created_by: session?.user?.id
            });
        }
      }
      
      console.log("Attempting to create notification for user", userId);
      const { data: notificationData, error: notificationError } = await supabase
        .from("notification")
        .insert({
          user_id: userId,
          content: `Your role has been updated to ${newRole} by an admin`,
          is_read: false
        });
      console.log("Notification creation result:", { data: notificationData, error: notificationError });

      await addLogEntry(
        Subsystem.USER_MANAGEMENT,
        ActionType.CHANGE_USER_ROLE,
        session?.user?.id as string,
        null,
        userId,
        null,
        { 
          role: {
            old: oldRole,
            new: newRole
          }
        }
      );

      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      handlePermissionUpdate(`Role updated successfully for ${userName} to ${newRole} ✅`);

      if (expandedUser === userId) {
        setExpandedUser(null);
        setTimeout(() => setExpandedUser(userId), 100);
      }
    } catch (error) {
      console.error("Error in handleRoleChange:", error);
      handlePermissionUpdate("Failed to update user role. Please try again.");
    }
  };

  const handleUserAdded = ({ message, newUser }: UserAddedData): void => {
    handlePermissionUpdate(message);
    fetchUsers();
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getRoleBadgeStyle = (role: string | null) => {
    switch(role) {
      case 'Admin':
        return { bgcolor: '#1e4d87', color: 'white' };
      case 'Librarian':
        return { bgcolor: '#5a92c9', color: 'white' };
      case 'SuperAdmin':
        return { bgcolor: '#11325b', color: 'white' };
      default:
        return { bgcolor: '#e2eaf4', color: '#1e4d87' };
    }
  };

  return (
    <>
      <Header />
      <div className="manage-thesis patterned-background">
        <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: '20px', position: 'relative', zIndex: 2 }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontSize: { xs: '1.75rem', md: '2.125rem' },
            fontWeight: 700, 
            color: '#1e4d87',
            marginBottom: '16px',
            textShadow: '0 2px 4px rgba(221, 218, 218, 0.05)'
          }}>
            User Management
          </Typography>
          
          <Typography variant="body1" sx={{ 
            color: '#FFFFFF', 
            marginBottom: '32px',
            maxWidth: '700px'
          }}>
            Manage users, assign roles, and control permissions for all members of the NEU Thesis Repository system.
          </Typography>

          <Box 
            sx={{
              display: "flex", 
              alignItems: "center", 
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'stretch'
              }
            }}
          >
            <Box 
              sx={{
                flex: 1,
                minWidth: "200px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "8px 16px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              <Search size={20} color="#5a6b7d" style={{ marginRight: 8 }} />
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ 
                  disableUnderline: true,
                  sx: { fontSize: "14px" }
                }}
              />
            </Box>

            <Box
              sx={{
                backgroundColor: "#1e4d87",
                color: "white",
                boxShadow: "0 4px 12px rgba(30, 77, 135, 0.3)",
                borderRadius: "8px",
                padding: "2px 4px",
                fontWeight: "600",
                textTransform: "none",
                whiteSpace: "nowrap",
                minWidth: 150,
                "&:hover": {
                  backgroundColor: "#11325b"
                }
              }}
            >
              <FormControl 
                variant="outlined" 
                size="small" 
                fullWidth
                sx={{ 
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    backgroundColor: "transparent",
                    color: "white",
                    "& fieldset": {
                      border: "none"
                    },
                    "&:hover fieldset": {
                      border: "none"
                    },
                    "&.Mui-focused fieldset": {
                      border: "none"
                    },
                    "& .MuiSelect-select": {
                      padding: "8px 32px 8px 12px",
                      fontWeight: 500,
                      fontSize: "14px"
                    },
                    "& .MuiSvgIcon-root": {
                      color: "white"
                    }
                  }
                }}
              >
                <Select
                  value={selectedRole || ""}
                  onChange={(e: SelectChangeEvent) => setSelectedRole(e.target.value || null)}
                  displayEmpty
                  renderValue={(value) => value ? value : "Filter by Role"}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Librarian">Librarian</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button
              onClick={() => setLogsOpen(true)}
              variant="contained"
              sx={{
                backgroundColor: "#1e4d87", 
                color: "white",
                boxShadow: "0 4px 12px rgba(30, 77, 135, 0.3)",
                '&:hover': {
                  backgroundColor: "#11325b"
                },
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: "600",
                textTransform: "none",
                whiteSpace: "nowrap"
              }}
              startIcon={<FileText size={18} />}
            >
              View Activity Logs
            </Button>
            
            <Button
              onClick={() => setAddUserDialogOpen(true)}
              variant="contained"
              sx={{
                backgroundColor: "#1e4d87", 
                color: "white",
                boxShadow: "0 4px 12px rgba(30, 77, 135, 0.3)",
                '&:hover': {
                  backgroundColor: "#11325b"
                },
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: "600",
                textTransform: "none",
                whiteSpace: "nowrap"
              }}
              startIcon={<UserPlus size={18} />}
            >
              Add User
            </Button>
          </Box>

          <Box sx={{ 
            backgroundColor: 'white', 
            borderRadius: '16px',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
            padding: '4px',
            overflow: 'hidden'
          }}>
            <TableContainer 
              component={Paper} 
              sx={{
                borderRadius: "12px",
                boxShadow: "none",
                overflow: "hidden",
                backgroundColor: "#ffffff"
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e2eaf4" }}>
                    <TableCell sx={{ fontWeight: "600", color: "#1e4d87", fontSize: "14px", padding: '16px' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#1e4d87", fontSize: "14px" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#1e4d87", fontSize: "14px" }}>Role</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "600", color: "#1e4d87", fontSize: "14px", width: '100px' }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <CircularProgress sx={{ color: "#1e4d87" }} />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8, color: "#5a6b7d" }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Search size={36} color="#c4cdd5" />
                          <Typography>No users found matching your criteria.</Typography>
                          <Button 
                            variant="text" 
                            onClick={() => {setSearchQuery(''); setSelectedRole(null);}}
                            sx={{ color: '#1e4d87', textTransform: 'none' }}
                          >
                            Clear filters
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <React.Fragment key={user.id}>
                        <TableRow 
                          onClick={() => handleRowClick(user.id)} 
                          sx={{ 
                            cursor: "pointer",
                            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafd",
                            '&:hover': {
                              backgroundColor: "rgba(30, 77, 135, 0.04)",
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            padding: '16px',
                            borderBottom: expandedUser === user.id ? 'none' : '1px solid rgba(224, 224, 224, 1)'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                src={userProfiles[user.id] || ''} 
                                sx={{ 
                                  bgcolor: user.id === session?.user?.id ? '#1e4d87' : '#5a92c9',
                                  width: 40, 
                                  height: 40,
                                  fontWeight: 500,
                                  fontSize: '16px'
                                }}
                              >
                                {getInitials(user.name || 'User')}
                              </Avatar>
                              <Typography sx={{ fontWeight: "500" }}>
                                {user.name || "No name found!"}
                                {user.id === session?.user?.id && (
                                  <Typography 
                                    component="span" 
                                    sx={{ 
                                      fontSize: '12px', 
                                      backgroundColor: '#e2eaf4', 
                                      color: '#1e4d87',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      marginLeft: '8px'
                                    }}
                                  >
                                    You
                                  </Typography>
                                )}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            color: "#5a6b7d",
                            borderBottom: expandedUser === user.id ? 'none' : '1px solid rgba(224, 224, 224, 1)'
                          }}>
                            {user.email}
                          </TableCell>
                          
                          <TableCell sx={{ 
                            borderBottom: expandedUser === user.id ? 'none' : '1px solid rgba(224, 224, 224, 1)'
                          }}>
                            {session?.user?.id !== user.id ? (
                              <FormControl 
                                variant="outlined" 
                                size="small" 
                                fullWidth 
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: "6px",
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: "#1e4d87",
                                    }
                                  }
                                }}
                              >
                                <Select
                                  value={(user.role || 'User')}
                                  onChange={(e) => handleRoleChange(user.id, user.name || "Unknown User", e.target.value)}
                                  sx={{
                                    height: "36px",
                                    fontSize: "14px",
                                    '&.MuiOutlinedInput-root': {
                                      '& fieldset': {
                                        borderColor: 'rgba(0, 0, 0, 0.15)',
                                      },
                                    }
                                  }}
                                  MenuProps={{
                                    PaperProps: {
                                      style: {
                                        width: 140,
                                        borderRadius: 8,
                                        marginTop: 4
                                      },
                                    },
                                  }}
                                >
                                  <MenuItem value="Admin">Admin</MenuItem>
                                  <MenuItem value="Librarian">Librarian</MenuItem>
                                  <MenuItem value="User">User</MenuItem>
                                </Select>
                              </FormControl>
                            ) : (
                              <Box
                                sx={{
                                  display: "inline-block",
                                  backgroundColor: getRoleBadgeStyle(user.role).bgcolor,
                                  color: getRoleBadgeStyle(user.role).color,
                                  borderRadius: "6px",
                                  padding: "6px 12px",
                                  fontSize: "13px",
                                  fontWeight: "500"
                                }}
                              >
                                {user.role}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            borderBottom: expandedUser === user.id ? 'none' : '1px solid rgba(224, 224, 224, 1)'
                          }}>
                            <IconButton 
                              sx={{ 
                                color: "#1e4d87",
                                backgroundColor: expandedUser === user.id ? 'rgba(30, 77, 135, 0.08)' : 'transparent',
                                '&:hover': {
                                  backgroundColor: "rgba(30, 77, 135, 0.12)",
                                }
                              }}
                            >
                              {expandedUser === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ 
                          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafd",
                        }}>
                          <TableCell colSpan={4} sx={{ padding: 0, borderBottom: expandedUser === user.id ? '1px solid rgba(224, 224, 224, 1)' : 'none' }}>
                            <Collapse in={expandedUser === user.id} timeout="auto" unmountOnExit>
                              <Box sx={{ 
                                padding: 3, 
                                backgroundColor: "rgba(30, 77, 135, 0.03)",
                                borderTop: '1px dashed rgba(30, 77, 135, 0.15)'
                              }}>
                                {expandedUser === user.id && (
                                  <UserPermissions 
                                    userId={user.id} 
                                    userName={user.name || "Unknown User"} 
                                    currentUserId={session?.user?.id}
                                    onPermissionUpdate={handlePermissionUpdate}
                                  />
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </div>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose} 
        message={snackbarMessage}
        ContentProps={{
          sx: {
            backgroundColor: snackbarMessage.includes("✅") ? "#2e7d32" : "#d32f2f",
            borderRadius: "8px"
          }
        }}
        sx={{ bottom: 24 }}
      />
      
      <CheckLogs 
        open={logsOpen} 
        onClose={() => setLogsOpen(false)} 
        context="user" 
      />
      
      <AddUserDialog
        open={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
        onUserAdded={handleUserAdded}
        currentUserId={session?.user?.id}
      />
    </>
  );
};

export default UserManagement;