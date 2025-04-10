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
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { Search, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Header } from "../components/Header";
import CheckLogs from "../components/CheckLogs";
import UserPermissions from "../components/UserManagement/UserPermissions";
import { useAuth } from "../context/AuthContext";
import { addLogEntry, Subsystem, ActionType } from "../components/CheckLogs";
import AddUserDialog from "../components/UserManagement/AddUserDialog"; // Import the new component
import "../styles/Manage.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
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
  const [addUserDialogOpen, setAddUserDialogOpen] = useState<boolean>(false); // New state for add user dialog

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    
    try {
      if(!profile) return console.error('User not found');
      
      let query;
      const userRole = profile.role;

      if(userRole == 'Admin'){
        query = supabase.from("users")
          .select("id, name, email, role")
          .or(`role.eq.User, id.eq.${profile.id}`);
      } else if (userRole == 'SuperAdmin') { 
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
      // Find old role for logging purposes
      const oldRole = users.find(u => u.id === userId)?.role || "none";
      
      // Update the role in the database
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        console.error("Error updating role:", error);
        handlePermissionUpdate(`Failed to update user role: ${error.message}. Please try again.`);
        return;
      }

      // Define default permissions for each role
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

      // Get the default permissions for the new role
      const permissions = defaultPermissions[newRole];
      
      // Update permissions in the user_permissions table
      for (const [subsystem, actions] of Object.entries(permissions)) {
        // First, delete existing permissions for this user and subsystem
        await supabase
          .from("user_permissions")
          .delete()
          .eq("user_id", userId)
          .eq("subsystem", subsystem);
        
        // Then insert new permissions
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

      // Log the role change
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

      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      // Show success message
      handlePermissionUpdate(`Role updated successfully for ${userName} to ${newRole} ✅`);

      // If the currently expanded user is the one being modified, refresh the permissions view
      if (expandedUser === userId) {
        setExpandedUser(null);
        setTimeout(() => setExpandedUser(userId), 100);
      }

    } catch (error) {
      console.error("Error in handleRoleChange:", error);
      handlePermissionUpdate("Failed to update user role. Please try again.");
    }
  };

  // Handle new user added
  const handleUserAdded = ({ message, newUser }: UserAddedData): void => {
    handlePermissionUpdate(message);
    fetchUsers(); // Refresh the user list
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Header />
      <div className="manage-thesis">
        <div className="manage-background-gradient"></div>
        <div className="manage-background-blur"></div>
        <div className="manage-background-radial"></div>

        <h1 className="title">Manage Users</h1>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            onClick={() => setAddUserDialogOpen(true)}
            variant="contained"
            color="primary"
            className="add-user-btn"
            startIcon={<UserPlus size={18} />}
          >
            Add User
          </Button>
          
          <Button
            onClick={() => setLogsOpen(true)}
            variant="contained"
            className="view-logs-btn"
          >
            View Logs
          </Button>
        </Box>

        <div className="filters-wrapper">
          <Box className="search-box">
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true, className: "search-field" }}
            />
            <Search size={25} className="search-icon" />
          </Box>

          <FormControl variant="outlined" size="small" style={{ minWidth: 200, marginLeft: 20 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={selectedRole || ""}
              onChange={(e: SelectChangeEvent) => setSelectedRole(e.target.value || null)}
              label="Filter by Role"
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Librarian">Librarian</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </Select>
          </FormControl>
        </div>

        <TableContainer component={Paper} className="content">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="center">Permissions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <TableRow onClick={() => handleRowClick(user.id)} style={{ cursor: "pointer" }}>
                      <TableCell>{user.name || "No name found!"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      
                      <TableCell>
                        {session?.user?.id !== user.id ? (
                          <FormControl 
                            variant="outlined" 
                            size="small" 
                            fullWidth 
                            onClick={(e) => e.stopPropagation()}
                            className="role-dropdown"
                          >
                            <Select
                              value={(user.role || 'User')}
                              onChange={(e) => handleRoleChange(user.id, user.name || "Unknown User", e.target.value)}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    width: 140,
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
                          user.role
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton>{expandedUser === user.id ? <ChevronUp /> : <ChevronDown />}</IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} style={{ padding: 0 }}>
                        <Collapse in={expandedUser === user.id} timeout="auto" unmountOnExit>
                          {expandedUser === user.id && (
                            <UserPermissions 
                              userId={user.id} 
                              userName={user.name || "Unknown User"} 
                              currentUserId={session?.user?.id}
                              onPermissionUpdate={handlePermissionUpdate}
                            />
                          )}
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

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose} 
        message={snackbarMessage} 
      />
      
      <CheckLogs 
        open={logsOpen} 
        onClose={() => setLogsOpen(false)} 
        context="user" 
      />
      
      {/* Add User Dialog */}
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