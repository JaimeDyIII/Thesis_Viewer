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
import { Search, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Header } from "../../components/Global/Header";
import CheckLogs from "../../components/Global/CheckLogs";
import UserPermissions from "../../components/UserManagement/UserPermissions";
import { useAuth } from "../../context/AuthContext";
import { addLogEntry, Subsystem, ActionType } from "../../components/Global/CheckLogs";
import "../../styles/Manage.css";
import { usePermissions } from "../../context/PermissionsContext";
import { UserManagementUserType } from "../../api/users/types";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserManagementUserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("Changes saved successfully ✅");
  const [logsOpen, setLogsOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { session, profile } = useAuth();
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
  const { permissions: userPermissions } = usePermissions(); 

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
      <div className="patterned-background">
        <div className="content-container">
          <div className="white-container">
            <Typography variant="h4" component="h1" gutterBottom>
              User Management
            </Typography>

            <Typography variant="body1" sx={{ mb: 3 }}>
              Manage users, assign roles, and control permissions for all members of the NEU Thesis Repository system.
            </Typography>

            <Box 
              mt={3} 
              display="flex" 
              flexDirection={{ xs: "column", sm: "row" }} 
              gap={2} 
              alignItems={{ xs: "stretch", sm: "center" }} 
              mb={3}
              justifyContent="space-between"
            >
              {/* Fixed Search Box Width */}
              <Box 
                display="flex" 
                alignItems="center" 
                sx={{ 
                  position: "relative",
                  width: { xs: "200%", sm: "280px", md: "320px" }, 
                  flexShrink: 0
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ pr: 2 }}
                />
                <Search size={18} style={{ position: "absolute", right: "20px", color: "#5a92c9" }} />
              </Box>
              
             
              <Box 
                display="flex" 
                gap={2} 
                flexWrap={{ xs: "wrap", sm: "nowrap" }} 
                sx={{ 
                  justifyContent: { xs: "stretch", sm: "flex-end" },
                  width: { xs: "100%", sm: "auto" }
                }}
              >
                {/* Role Dropdown with Matching Style */}
                <FormControl 
                  size="small" 
                  sx={{ 
                    width: { xs: "100%", sm: "150px" },
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      backgroundColor: "#1e4d87",
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1e4d87"
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#11325b"
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#11325b"
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
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500
                    }}
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Librarian">Librarian</MenuItem>
                    <MenuItem value="User">User</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Activity Logs Button */}
                <Button
                  onClick={() => setLogsOpen(true)}
                  variant="contained"
                  startIcon={<FileText size={18} />}
                  sx={{
                    backgroundColor: "#1e4d87",
                    height: "40px",
                    width: { xs: "100%", sm: "auto" },
                    whiteSpace: "nowrap",
                    '&:hover': { backgroundColor: "#11325b" },
                    fontSize: "14px",
                    fontWeight: 500
                  }}
                >
                  View Activity Logs
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 3, overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e2eaf4" }}>
                    <TableCell sx={{ fontWeight: "600", color: "#1e4d87" }}>User</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#1e4d87", display: { xs: "none", md: "table-cell" } }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#1e4d87" }}>Role</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "600", color: "#1e4d87", width: '50px' }}>Details</TableCell>
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
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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
                          onClick={userPermissions?.UserManagement_edit ? (() => handleRowClick(user.id)) : undefined} 
                          sx={{ 
                            cursor: "pointer",
                            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafd",
                            '&:hover': {
                              backgroundColor: "rgba(30, 77, 135, 0.04)",
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            borderBottom: expandedUser === user.id ? 'none' : '1px solid rgba(224, 224, 224, 1)'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                src={userProfiles[user.id] || ''} 
                                sx={{ 
                                  bgcolor: user.id === session?.user?.id ? '#1e4d87' : '#5a92c9',
                                  width: 32, 
                                  height: 32,
                                  fontWeight: 500,
                                  fontSize: '14px'
                                }}
                              >
                                {getInitials(user.name || 'User')}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: "500", fontSize: { xs: "14px", sm: "16px" } }}>
                                  {user.name || "No name found!"}
                                </Typography>
                                <Typography 
                                  sx={{ 
                                    display: { xs: "block", md: "none" }, 
                                    fontSize: "12px",
                                    color: "#5a6b7d"
                                  }}
                                >
                                  {user.email}
                                </Typography>
                                {user.id === session?.user?.id && (
                                  <Typography 
                                    component="span" 
                                    sx={{ 
                                      fontSize: '11px', 
                                      backgroundColor: '#e2eaf4', 
                                      color: '#1e4d87',
                                      padding: '2px 4px',
                                      borderRadius: '4px',
                                      marginLeft: '4px'
                                    }}
                                  >
                                    You
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            color: "#5a6b7d",
                            display: { xs: "none", md: "table-cell" },
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
                              >
                                <Select
                                  value={(user.role || 'User')}
                                  onChange={(e) => handleRoleChange(user.id, user.name || "Unknown User", e.target.value)}
                                  sx={{
                                    height: { xs: "32px", sm: "36px" },
                                    fontSize: { xs: "12px", sm: "14px" }
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
                                  padding: "4px 8px",
                                  fontSize: "12px",
                                  fontWeight: "500"
                                }}
                              >
                                {user.role}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            borderBottom: expandedUser === user.id ? 'none' : '1px solid rgba(224, 224, 224, 1)',
                            width: '50px'
                          }}>
                            <IconButton 
                              sx={{ 
                                color: "#1e4d87",
                                backgroundColor: expandedUser === user.id ? 'rgba(30, 77, 135, 0.08)' : 'transparent',
                                padding: { xs: 0.5, sm: 1 },
                                '&:hover': {
                                  backgroundColor: "rgba(30, 77, 135, 0.12)",
                                }
                              }}
                            >
                              {expandedUser === user.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ 
                          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafd",
                        }}>
                          <TableCell colSpan={4} sx={{ padding: 0, borderBottom: expandedUser === user.id ? '1px solid rgba(224, 224, 224, 1)' : 'none' }}>
                            <Collapse in={expandedUser === user.id} timeout="auto" unmountOnExit>
                              <Box sx={{ 
                                padding: { xs: 2, sm: 3 }, 
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
          </div>
        </div>
      </div>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose} 
        message={snackbarMessage}
        sx={{ bottom: 24 }}
      />
      
      <CheckLogs 
        open={logsOpen} 
        onClose={() => setLogsOpen(false)} 
        context="user" 
      />
    </>
  );
};

export default UserManagement;