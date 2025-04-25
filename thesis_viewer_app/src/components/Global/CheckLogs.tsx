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
import { supabase } from "../../lib/supabase";

export enum Subsystem {
  THESIS_REPOSITORY = "ThesisRepository",
  USER_MANAGEMENT = "UserManagement"
}

export enum ActionType {
  ADD_THESIS = "add_thesis",
  EDIT_THESIS = "edit_thesis",
  EDIT_CATEGORIES = "edit_categories",
  DELETE_THESIS = "delete_thesis",
  ADD_USER = "add_user",
  CHANGE_USER_ROLE = "change_user_role",
  CHANGE_USER_PERMISSION = "change_user_permission"
}

export interface LogEntry {
  id: number;
  subsystem: Subsystem;
  action: ActionType;
  user_id: string;
  thesis_id: number | null;
  affected_user_id: string | null;
  affected_category: number | null;
  details: any;
  timestamp: string;
}

interface CheckLogsProps {
  open: boolean;
  onClose: () => void;
  context?: 'thesis' | 'user' | 'category';
}

export const addLogEntry = async (
  subsystem: Subsystem,
  action: ActionType,
  user_id: string,
  thesis_id: number | null = null,
  affected_user_id: string | null = null,
  affected_category: number | null = null,
  details: any = {}
) => {
  try {
    const { error: userError } = await supabase
      .from("users")
      .select("name")
      .eq("id", user_id)
      .single();
  
    if (userError) {
      console.error("Error fetching user name:", userError);
    }
  
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
  
  
    const { error } = await supabase.from("system_logs").insert([
      {
        subsystem,
        action,
        user_id,
        thesis_id,
        affected_user_id,
        affected_category,
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
    case ActionType.ADD_USER:
      return "success";
    case ActionType.EDIT_THESIS:
      return "info";
    case ActionType.EDIT_CATEGORIES:
      return "warning";
    case ActionType.DELETE_THESIS:
      return "error";
    case ActionType.CHANGE_USER_ROLE:
      return "secondary";
    case ActionType.CHANGE_USER_PERMISSION:
      return "info"; 
    default:
      return "default";
  }
};


const getActionDisplayName = (action: ActionType) => {
  switch (action) {
    case ActionType.ADD_THESIS:
      return "Add Thesis";
    case ActionType.EDIT_THESIS:
      return "Edit Thesis";
    case ActionType.EDIT_CATEGORIES:
      return "Edit Categories";
    case ActionType.DELETE_THESIS:
      return "Delete Thesis";
    case ActionType.ADD_USER:
      return "Add User";
    case ActionType.CHANGE_USER_ROLE:
      return "Change Role";
    case ActionType.CHANGE_USER_PERMISSION:
      return "Change Permission";
    default:
      return action;
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
    <Box 
      sx={{ 
        maxHeight: "120px", 
        overflow: "auto", 
        fontSize: "0.9rem", 
        p: 1,
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        bgcolor: "#f9f9f9"
      }}
    >
      <ul style={{ margin: 0, paddingLeft: "16px" }}>
        {Object.entries(details).map(([key, value]) => {
          if (typeof value === "object" && value !== null && "old" in value && "new" in value) {
            const formatValue = (val: any) =>
              typeof val === "boolean" ? (val ? "Active" : "Inactive") : String(val);

            return (
              <li key={key}>
                <Typography component="span" fontWeight="medium">{key.replace(/_/g, " ")}:</Typography>{" "}
                <Chip 
                  size="small" 
                  label={formatValue(value.old)} 
                  sx={{ mr: 1, fontSize: "0.75rem" }}
                /> 
                →{" "}
                <Chip 
                  size="small" 
                  label={formatValue(value.new)} 
                  color="primary" 
                  sx={{ fontSize: "0.75rem" }}
                />
              </li>
            );
          } else {
            const displayValue = typeof value === "boolean" ? (value ? "Active" : "Inactive") : String(value);

            return (
              <li key={key}>
                <Typography component="span" fontWeight="medium">{key.replace(/_/g, " ")}:</Typography>{" "}
                <span>{displayValue}</span>
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
  

  const getContextDisplayName = () => {
    switch (context) {
      case 'thesis':
        return 'Thesis Repository';
      case 'user':
        return 'User Management';
      case 'category':
        return 'Category Management';
      default:
        return 'System';
    }
  };


  const thesisActions = [
    ActionType.ADD_THESIS,
    ActionType.EDIT_THESIS,
    ActionType.EDIT_CATEGORIES,
    ActionType.DELETE_THESIS
  ];
  
  const userActions = [
    ActionType.ADD_USER,
    ActionType.CHANGE_USER_ROLE,
    ActionType.CHANGE_USER_PERMISSION
  ];

  const categoryActions = [
    ActionType.EDIT_CATEGORIES
  ];

  useEffect(() => {
    if (!open) return;
  
    const fetchLogs = async () => {
      setLoading(true);
  
      let query = supabase.from("system_logs").select("*");
      
   
      if (context === 'thesis') {
        query = query.eq("subsystem", Subsystem.THESIS_REPOSITORY);
      } else if (context === 'user') {
        query = query.eq("subsystem", Subsystem.USER_MANAGEMENT);
      }
      

      const { data: logsData, error: logsError } = await query.order("timestamp", { ascending: false });
  
      if (logsError) {
        console.error("Error fetching logs:", logsError);
        setLogs([]);
        setFilteredLogs([]);
        setLoading(false);
        return;
      }
  
  
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
      
      let categoryMap: Record<number, string> = {};
      const categoryIds = Array.from(new Set(logsData.map(log => log.affected_category).filter(Boolean)));
      if (categoryIds.length > 0) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("category")
          .select("id, name")
          .in("id", categoryIds);
    
        if (categoryError) {
          console.error("Error fetching categories:", categoryError);
        }
    
        categoryMap = categoryData ? Object.fromEntries(categoryData.map(category => [category.id, category.name])) : {};
      }


      const processedLogs = logsData.map(log => ({
        ...log,
        user_id: userMap[log.user_id] || "Unknown User",
        affected_user_id: log.affected_user_id ? userMap[log.affected_user_id] || "Unknown User" : "N/A",
        thesis_id: log.thesis_id && context === 'thesis' ? thesisMap[log.thesis_id] || "Unknown Thesis" : "N/A",
        affected_category: log.affected_category ? categoryMap[log.affected_category] || "Unknown Category" : "N/A"
      }));
  
      setLogs(processedLogs);
      setFilteredLogs(processedLogs);
      setLoading(false);
    };
  
    fetchLogs();
  }, [open, context]);  


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

  
  const getContextActions = () => {
    if (context === 'thesis') return thesisActions;
    if (context === 'user') return userActions;
    if (context === 'category') return categoryActions;
    return Object.values(ActionType);
  };


  const determineActionType = (detailsObject: any) => {
    if (!detailsObject) return ActionType.CHANGE_USER_PERMISSION;
    
    // Check if details contain role changes
    if (
      (detailsObject.role && typeof detailsObject.role === 'object') ||
      Object.keys(detailsObject).some(key => key.toLowerCase().includes('role'))
    ) {
      return ActionType.CHANGE_USER_ROLE;
    }
    
    // Default to permission change
    return ActionType.CHANGE_USER_PERMISSION;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { maxHeight: "90vh" } }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'background.paper',
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {getContextDisplayName()} Activity Logs
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
    
        

      <Paper 
  elevation={3}
  sx={{ 
    mb: 3, 
    p: 2.5, 
    bgcolor: '#ebebed', 
    display: "flex", 
    flexWrap: "wrap", 
    gap: 2,
    alignItems: "center",
    borderRadius: 2,
    boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
  }}
>
  <Typography variant="h6" sx={{ width: '100%', mb: 1.5, color: 'primary.main', fontWeight: 'medium' }}>
    Filters
  </Typography>
  
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%', alignItems: 'flex-end' }}>
    <FormControl size="small" sx={{ minWidth: 180, flexGrow: 1 }}>
      <InputLabel id="action-type-label">Action Type</InputLabel>
      <Select
        labelId="action-type-label"
        value={actionFilter}
        label="Action Type"
        onChange={(e) => setActionFilter(e.target.value)}
        className="action-type-select"
        sx={{ bgcolor: 'background.paper' }}
      >
        <MenuItem value="">All Actions</MenuItem>
        {getContextActions().map((action) => (
          <MenuItem key={action} value={action}>
            <Chip 
              size="small" 
              label={getActionDisplayName(action)} 
              color={getActionColor(action) as any}
              sx={{ fontWeight: 500 }}
            />
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
      placeholder="Filter by username"
      sx={{ minWidth: 180, flexGrow: 1, bgcolor: 'background.paper' }}
      InputProps={{
        endAdornment: usernameFilter && (
          <Button size="small" sx={{ minWidth: 'auto', p: 0.5 }} onClick={() => setUsernameFilter("")}>
            <Typography variant="caption">✕</Typography>
          </Button>
        )
      }}
    />
    
    <TextField
      label="Date"
      variant="outlined"
      type="date"
      size="small"
      value={dateFilter}
      onChange={(e) => setDateFilter(e.target.value)}
      InputLabelProps={{ shrink: true }}
      sx={{ minWidth: 180, flexGrow: 1, bgcolor: 'background.paper' }}
    />
    
    <Button 
      variant="contained" 
      size="medium" 
      onClick={resetFilters}
      startIcon={<Box component="span" sx={{ fontSize: '18px' }}>↺</Box>}
      sx={{ 
        height: "40px", 
        bgcolor: 'primary.light', 
        '&:hover': { bgcolor: 'primary.main' },
        ml: 'auto'
      }}
    >
     
    </Button>
  </Box>
</Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 8 }}>
            <CircularProgress size={40} />
            <Typography sx={{ ml: 2 }}>Loading logs...</Typography>
          </Box>
        ) : filteredLogs.length === 0 ? (
          <Paper 
            sx={{ 
              py: 8, 
              px: 3,
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              bgcolor: "#FFFFFF",
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>No logs found</Typography>
            <Typography color="text.secondary" align="center">
              No activity logs match your current filter criteria. Try adjusting your filters or check back later.
            </Typography>
          </Paper>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{ 
              maxHeight: "500px",
              borderRadius: 3,
              boxShadow: '0 2px 4px rgba(91, 88, 240, 0.98)'
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#1e4d87" }}>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5 ,color: "red"}}>ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5 ,color: "#4682A9"}}>Action</TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5 ,color: "#4682A9"}}>User</TableCell>
                  {context === 'thesis' && <TableCell sx={{ fontWeight: "bold", py: 1.5 ,color: "#4682A9"}}>Thesis Title</TableCell>}
                  {context === 'user' && <TableCell sx={{ fontWeight: "bold", py: 1.5 ,color: "#4682A9"}}>Affected User</TableCell>}
                  {context === 'category' && <TableCell sx={{ fontWeight: "bold", py: 1.5 ,color: "#4682A9"}}>Affected Category</TableCell>}
                  <TableCell sx={{ fontWeight: "bold", py: 1.5 ,color: "#4682A9"}}>Details</TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5 ,color: "green"}}>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => {
                  
                  const displayAction = context === 'user' && log.action === ActionType.CHANGE_USER_PERMISSION
                    ? determineActionType(log.details)
                    : log.action;
                    
                  return (
                    <TableRow 
                      key={log.id} 
                      hover
                      sx={{
                        '&:nth-of-type(odd)': { bgcolor: 'rgba(0, 0, 0, 0.01)' },
                      }}
                    >
                      <TableCell>{log.id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getActionDisplayName(displayAction)} 
                          size="small" 
                          color={getActionColor(displayAction) as any} 
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>{log.user_id}</TableCell>
                      {context === 'thesis' && <TableCell>{log.thesis_id}</TableCell>}
                      {context === 'user' && <TableCell>{log.affected_user_id}</TableCell>}
                      {context === 'category' && <TableCell>{log.affected_category}</TableCell>}
                      <TableCell width="30%">{formatDetails(log.details)}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{new Date(log.timestamp).toLocaleDateString()}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(log.timestamp).toLocaleTimeString()}</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={onClose} 
          color="primary" 
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Close
        </Button>
        
      </DialogActions>
    </Dialog>
  );
};

export default CheckLogs;