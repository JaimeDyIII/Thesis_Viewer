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
} from "@mui/material";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Header } from "../components/Header";
import CheckLogs from "../components/CheckLogs";
import UserPermissions from "../components/UserPermissions";
import { useAuth } from "../context/AuthContext";
import "../styles/Manage.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Changes saved successfully ✅");
  const [logsOpen, setLogsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      
      try {
        let query = supabase.from("users").select("id, name, email, role");
        
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
    
    fetchUsers();
  }, [selectedRole]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRowClick = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const handlePermissionUpdate = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
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

        <Box display="flex" justifyContent="flex-end" mb={2}>
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
              onChange={(e) => setSelectedRole(e.target.value || null)}
              label="Filter by Role"
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="librarian">Librarian</MenuItem>
              <MenuItem value="student">Student</MenuItem>
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
                      <TableCell>{user.role}</TableCell>
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
    </>
  );
};

export default UserManagement;