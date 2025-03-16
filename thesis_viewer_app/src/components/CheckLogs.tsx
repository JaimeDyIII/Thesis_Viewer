import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";
import { supabase } from "../lib/supabase";

export enum Subsystem{
  THESIS_REPOSITORY = "ThesisRepository",
  USER_MANAGEMENT = "UserManagement"
}

// Define action types enum
export enum ActionType {
  ADD_THESIS = "add_thesis",
  EDIT_THESIS = "edit_thesis",
  CHANGE_THESIS_STATUS = "change_thesis_status",
  DELETE_THESIS = "delete_thesis",
  CHANGE_USER_PERMISSION = "change_user_permission",
  CHANGE_USER_ROLE = "change_user_role"
}

export interface LogEntry {
  id: number;
  subsystem: Subsystem;
  action: ActionType;
  user_id: string;
  thesis_id: number | null;
  affected_user_id: string | null;
  details: any;
  timestamp: string;
}

interface CheckLogsProps {
  open: boolean;
  onClose: () => void;
  context?: 'thesis' | 'user';
}

export const addLogEntry = async (
  subsystem: Subsystem,
  action: ActionType,
  user_id: string,
  thesis_id: number | null = null,
  affected_user_id: string | null = null,
  details: any = {}
) => {
  try {
    // Fetch user full name from the Users table
    const { error: userError } = await supabase
      .from("users")
      .select("name")
      .eq("id", user_id)
      .single();
  
    if (userError) {
      console.error("Error fetching user name:", userError);
    }
  
    // Fetch affected user name (if applicable)
    if (affected_user_id) {
      const { error: affectedUserError } = await supabase
        .from("users")
        .select("name")
        .eq("id", affected_user_id)
        .single();
  
      if (affectedUserError) {
        console.error("Error fetching affected user name:", affectedUserError);
      }
    }
  
    // Fetch thesis title (if applicable)
    if (thesis_id) {
      const { error: thesisError } = await supabase
        .from("Thesis")
        .select("title")
        .eq("id", thesis_id)
        .single();
  
      if (thesisError) {
        console.error("Error fetching thesis title:", thesisError);
      }
    }
  
    // Insert log entry with resolved names
    const { error } = await supabase.from("system_logs").insert([
      {
        subsystem,
        action,
        user_id,
        thesis_id,
        affected_user_id,
        details: {
          ...details
        },
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error logging action:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error logging action:", err);
    return false;
  }
};

const getActionColor = (action: ActionType) => {
  switch (action) {
    case ActionType.ADD_THESIS:
      return "success";
    case ActionType.EDIT_THESIS:
      return "info";
    case ActionType.CHANGE_THESIS_STATUS:
      return "warning";
    case ActionType.DELETE_THESIS:
      return "error";
    case ActionType.CHANGE_USER_PERMISSION:
    case ActionType.CHANGE_USER_ROLE:
      return "secondary";
    default:
      return "default";
  }
};

const formatDetails = (details: any) => {
  if (!details) return "N/A";

  if (typeof details === "string") {
    try {
      details = JSON.parse(details);
    } catch (e) {
      return details;
    }
  }

  return (
    <Box sx={{ maxHeight: "120px", overflow: "auto", fontSize: "0.9rem", p: 1 }}>
      <ul style={{ margin: 0, paddingLeft: "16px" }}>
        {Object.entries(details).map(([key, value]) => {
          if (typeof value === "object" && value !== null && "old" in value && "new" in value) {
            const formatValue = (val: any) =>
              typeof val === "boolean" ? (val ? "Active" : "Inactive") : String(val);

            return (
              <li key={key}>
                <strong>{key}:</strong> {formatValue(value.old)} → {formatValue(value.new)}
              </li>
            );
          } else {
            const displayValue = typeof value === "boolean" ? (value ? "Active" : "Inactive") : String(value);

            return (
              <li key={key}>
                <strong>{key}:</strong> {displayValue}
              </li>
            );
          }
        })}
      </ul>
    </Box>
  );
};

const CheckLogs: React.FC<CheckLogsProps> = ({ open, onClose, context = 'thesis' }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [usernameFilter, setUsernameFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Define context-specific actions
  const thesisActions = [
    ActionType.ADD_THESIS,
    ActionType.EDIT_THESIS,
    ActionType.CHANGE_THESIS_STATUS,
    ActionType.DELETE_THESIS
  ];
  
  const userActions = [
    ActionType.CHANGE_USER_PERMISSION,
    ActionType.CHANGE_USER_ROLE
  ];

  useEffect(() => {
    if (!open) return;
  
    const fetchLogs = async () => {
      setLoading(true);
  
      let query = supabase.from("system_logs").select("*");
      
      // Filter by subsystem based on context
      if (context === 'thesis') {
        query = query.eq("subsystem", Subsystem.THESIS_REPOSITORY);
      } else if (context === 'user') {
        query = query.eq("subsystem", Subsystem.USER_MANAGEMENT);
      }
      
      // Execute query and order by timestamp
      const { data: logsData, error: logsError } = await query.order("timestamp", { ascending: false });
  
      if (logsError) {
        console.error("Error fetching logs:", logsError);
        setLogs([]);
        setFilteredLogs([]);
        setLoading(false);
        return;
      }
  
      // Fetch user data
      const userIds = Array.from(new Set(logsData.flatMap(log => [log.user_id, log.affected_user_id].filter(Boolean))));
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, name")
        .in("id", userIds);
  
      if (usersError) {
        console.error("Error fetching users:", usersError);
      }
  
      const userMap = usersData ? Object.fromEntries(usersData.map(user => [user.id, user.name])) : {};
  
      // Fetch thesis data only for thesis context
      let thesisMap: Record<number, string> = {};
      if (context === 'thesis') {
        const thesisIds = Array.from(new Set(logsData.map(log => log.thesis_id).filter(Boolean)));
        if (thesisIds.length > 0) {
          const { data: thesisData, error: thesisError } = await supabase
            .from("Thesis")
            .select("id, title")
            .in("id", thesisIds);
      
          if (thesisError) {
            console.error("Error fetching theses:", thesisError);
          }
      
          thesisMap = thesisData ? Object.fromEntries(thesisData.map(thesis => [thesis.id, thesis.title])) : {};
        }
      }
  
      // Replace IDs with names/titles
      const processedLogs = logsData.map(log => ({
        ...log,
        user_id: userMap[log.user_id] || "Unknown User",
        affected_user_id: log.affected_user_id ? userMap[log.affected_user_id] || "Unknown User" : "N/A",
        thesis_id: log.thesis_id && context === 'thesis' ? thesisMap[log.thesis_id] || "Unknown Thesis" : "N/A"
      }));
  
      setLogs(processedLogs);
      setFilteredLogs(processedLogs);
      setLoading(false);
    };
  
    fetchLogs();
  }, [open, context]);  

  // Apply filters whenever filter state changes
  useEffect(() => {
    let result = [...logs];

    if (actionFilter) {
      result = result.filter(log => log.action === actionFilter);
    }

    if (usernameFilter) {
      result = result.filter(log => 
        log.user_id.toLowerCase().includes(usernameFilter.toLowerCase()) || 
        (log.affected_user_id && log.affected_user_id.toLowerCase().includes(usernameFilter.toLowerCase()))
      );
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      result = result.filter(log => 
        new Date(log.timestamp).toDateString() === filterDate
      );
    }

    setFilteredLogs(result);
  }, [logs, actionFilter, usernameFilter, dateFilter]);

  const resetFilters = () => {
    setActionFilter("");
    setUsernameFilter("");
    setDateFilter("");
  };

  // Get the appropriate actions list based on context
  const getContextActions = () => {
    if (context === 'thesis') return thesisActions;
    if (context === 'user') return userActions;
    return Object.values(ActionType);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {context === 'thesis' ? 'Thesis Repository Logs' : 'User Management Logs'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* Filters Section */}
        <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={actionFilter}
              label="Action Type"
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <MenuItem value="">All Actions</MenuItem>
              {getContextActions().map((action) => (
                <MenuItem key={action} value={action}>
                  {action}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Username"
            variant="outlined"
            size="small"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
          />
          
          <TextField
            label="Date"
            variant="outlined"
            type="date"
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={resetFilters}
            sx={{ height: "40px" }}
          >
            Reset Filters
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredLogs.length === 0 ? (
          <Typography align="center" sx={{ py: 4 }}>No logs found matching your criteria.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: "500px" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>User</TableCell>
                  {context === 'thesis' && <TableCell>Thesis Title</TableCell>}
                  {context === 'user' && <TableCell>Affected User</TableCell>}
                  <TableCell>Details</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" color={getActionColor(log.action) as any} variant="outlined" />
                    </TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    {context === 'thesis' && <TableCell>{log.thesis_id}</TableCell>}
                    {context === 'user' && <TableCell>{log.affected_user_id}</TableCell>}
                    <TableCell>{formatDetails(log.details)}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckLogs;