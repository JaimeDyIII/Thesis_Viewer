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
  Checkbox,
  Typography,
  Snackbar,
} from "@mui/material";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Header } from "../components/Header";
import "../styles/ManageThesis.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Permission {
  subsystem: string;
  permission_type: string;
  permitted: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<{ [key: string]: Permission[] }>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("id, name, email, role");
    if (error) console.error("Error fetching users:", error);
    else setUsers(data || []);
    setLoading(false);
  };

  const fetchPermissions = async (userId: string) => {
    const { data, error } = await supabase.from("user_permissions").select("subsystem, permission_type, permitted").eq("userid", userId);
    if (error) console.error("Error fetching permissions:", error);
    else setPermissions((prev) => ({ ...prev, [userId]: data || [] }));
  };

  const handlePermissionChange = async (userId: string, subsystem: string, permission_type: string, permitted: boolean) => {
    const { error } = await supabase
      .from("user_permissions")
      .update({ permitted: !permitted })
      .eq("userid", userId)
      .eq("subsystem", subsystem)
      .eq("permission_type", permission_type);

    if (error) {
      console.error("Error updating permission:", error);
    } else {
      setPermissions((prev) => {
        const updatedPermissions = prev[userId].map((perm) =>
          perm.subsystem === subsystem && perm.permission_type === permission_type ? { ...perm, permitted: !permitted } : perm
        );
        return { ...prev, [userId]: updatedPermissions };
      });
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRowClick = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      if (!permissions[userId]) fetchPermissions(userId);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="manage-thesis">
        <div className="manage-background-gradient"></div>
        <div className="manage-background-blur"></div>
        <div className="manage-background-radial"></div>

        <h1 className="title">Manage Users</h1>

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
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell align="center">
                        <IconButton>{expandedUser === user.id ? <ChevronUp /> : <ChevronDown />}</IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} style={{ padding: 0 }}>
                        <Collapse in={expandedUser === user.id} timeout="auto" unmountOnExit>
                          <Box margin={2}>
                            {permissions[user.id]?.length ? (
                              Object.entries(
                                permissions[user.id].reduce((acc, perm) => {
                                  acc[perm.subsystem] = acc[perm.subsystem] || [];
                                  acc[perm.subsystem].push(perm);
                                  return acc;
                                }, {} as Record<string, Permission[]>)
                              ).map(([subsystem, perms]) => (
                                <Box key={subsystem} mb={2}>
                                  <Typography variant="h6">{subsystem}</Typography>
                                  <Box display="flex" gap={2}>
                                    {perms.map((perm) => (
                                      <Box key={perm.permission_type} display="flex" alignItems="center">
                                        <Checkbox
                                          checked={perm.permitted}
                                          onChange={() => handlePermissionChange(user.id, subsystem, perm.permission_type, perm.permitted)}
                                        />
                                        {perm.permission_type.charAt(0).toUpperCase() + perm.permission_type.slice(1)}
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              ))
                            ) : (
                              <p>No permissions found.</p>
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
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose} message="Permissions changed successfully ✅" />
    </>
  );
};

export default UserManagement;
