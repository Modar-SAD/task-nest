import { useState, useRef, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Paper,
  Chip,
  useTheme,
  alpha,
  Container,
  Menu,
  MenuItem,
  Fade,
  Grow,
  ClickAwayListener,
  Popper,
  Collapse,
  Alert,
  CssBaseline,
  useMediaQuery,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab,
  Modal,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Info as InfoIcon,
  SmartToy as RobotIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { auth, taskService } from '../../services/firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1976d2',
        light: mode === 'dark' ? '#e3f2fd' : '#bbdefb',
        dark: mode === 'dark' ? '#42a5f5' : '#1565c0',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#9c27b0',
        light: mode === 'dark' ? '#fce4ec' : '#e1bee7',
        dark: mode === 'dark' ? '#f06292' : '#7b1fa2',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#2c3e50',
        secondary: mode === 'dark' ? '#b0bec5' : '#546e7a',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }), [mode]);

  const [tasks, setTasks] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: new Date(),
  });
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "I am your smart assistant to organize your tasks and help you create new ones.\n\nReminder: You have an important meeting on Thursday at 6:00 PM.\nReminder: You have an important email that you must send by the end of the day.",
      timestamp: new Date(),
    },
  ]);
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      unsubscribeRef.current = taskService.subscribeToTasks(user.uid, (updatedTasks) => {
        setTasks(updatedTasks);
        setLoading(false);
      });
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [navigate]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    const user = auth.currentUser;

    if (!user) return;

    try {
      if (sourceColumn === destColumn) {
        const column = tasks[sourceColumn];
        const copiedItems = [...column];
        const [removed] = copiedItems.splice(source.index, 1);
        copiedItems.splice(destination.index, 0, removed);
        setTasks({
          ...tasks,
          [sourceColumn]: copiedItems,
        });
      } else {
        const sourceItems = [...tasks[sourceColumn]];
        const destItems = [...tasks[destColumn]];
        const [removed] = sourceItems.splice(source.index, 1);
        removed.status = destColumn;
        destItems.splice(destination.index, 0, removed);
        
        await taskService.updateTask(user.uid, removed.id, { status: destColumn });
        
        setTasks({
          ...tasks,
          [sourceColumn]: sourceItems,
          [destColumn]: destItems,
        });
      }
    } catch (error) {
      setError(error.message);
      showNotification('Failed to update task status');
    }
  };

  const handleAddTask = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const newTaskWithId = {
        ...newTask,
        status: 'todo',
      };
      
      await taskService.addTask(user.uid, newTaskWithId);
      setNewTask({ title: '', description: '', deadline: new Date() });
      setOpenDialog(false);
      
      const taskMessage = {
        id: chatMessages.length + 1,
        type: 'assistant',
        content: "I've created a new task for you. Let me know if you need any help managing it!",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, taskMessage]);
    } catch (error) {
      setError(error.message);
      showNotification('Failed to add task');
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'done':
        return 'Task completed';
      case 'overdue':
        return 'Task is overdue';
      case 'warning':
        return 'Task due within 3 days';
      case 'onTrack':
        return 'Task on track';
      default:
        return '';
    }
  };

  const getStatusColor = (deadline, status) => {
    if (status === 'done') return theme.palette.grey[500];
    const today = new Date();
    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return theme.palette.error.main;
    if (diffDays <= 3) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStatusType = (deadline, status) => {
    if (status === 'done') return 'done';
    const today = new Date();
    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'warning';
    return 'onTrack';
  };

  const getColumnTheme = (columnId) => {
    switch (columnId) {
      case 'todo':
        return {
          main: theme.palette.primary.main,
          light: theme.palette.primary.light,
          dark: theme.palette.primary.dark,
        };
      case 'inProgress':
        return {
          main: theme.palette.info.main,
          light: theme.palette.info.light,
          dark: theme.palette.info.dark,
        };
      case 'done':
        return {
          main: theme.palette.success.main,
          light: theme.palette.success.light,
          dark: theme.palette.success.dark,
        };
      default:
        return {
          main: theme.palette.grey[500],
          light: theme.palette.grey[300],
          dark: theme.palette.grey[700],
        };
    }
  };

  const filteredTasks = {
    todo: tasks.todo?.filter(task => 
      filter === 'all' || (filter === 'pending' && task.status !== 'done')
    ) || [],
    inProgress: tasks.inProgress?.filter(task => 
      filter === 'all' || (filter === 'pending' && task.status !== 'done')
    ) || [],
    done: tasks.done?.filter(task => 
      filter === 'all' || (filter === 'completed' && task.status === 'done')
    ) || [],
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleTaskUpdate = async (updatedTask) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await taskService.updateTask(user.uid, updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        deadline: updatedTask.deadline,
      });
      
      setEditingTask(null);
      showNotification('Task updated successfully');
    } catch (error) {
      setError(error.message);
      showNotification('Failed to update task');
    }
  };

  const handleDeleteTask = (task) => {
    setDeleteConfirmTask(task);
  };

  const confirmDeleteTask = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await taskService.deleteTask(user.uid, deleteConfirmTask.id);
      setDeleteConfirmTask(null);
      showNotification('Task deleted successfully');
    } catch (error) {
      setError(error.message);
      showNotification('Failed to delete task');
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!assistantMessage.trim()) return;

    const newMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      content: assistantMessage,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setAssistantMessage('');

    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        type: 'assistant',
        content: "I understand you're asking about tasks. I'll help you manage them effectively!",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          height: '100vh',
          width: '100vw',
          background: mode === 'dark' 
            ? `linear-gradient(135deg, ${alpha('#1a237e', 0.2)} 0%, ${alpha('#311b92', 0.2)} 100%)`
            : `linear-gradient(135deg, ${alpha('#e3f2fd', 0.8)} 0%, ${alpha('#f3e5f5', 0.8)} 100%)`,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon color="primary" />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Task Dashboard
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton 
                sx={{ 
                  mr: 2,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'rotate(180deg)',
                  },
                  color: mode === 'light' ? theme.palette.primary.main : 'inherit',
                }} 
                onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} 
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                cursor: 'pointer',
              }}
              onClick={handleUserMenuClick}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                user@example.com
              </Typography>
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }}
              >
                U
              </Avatar>
              <ArrowDownIcon 
                sx={{ 
                  color: theme.palette.text.secondary,
                  transition: 'transform 0.3s ease-in-out',
                  transform: userMenuAnchor ? 'rotate(180deg)' : 'none',
                }} 
              />
            </Box>
          </Toolbar>
        </AppBar>

        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 180,
            },
          }}
        >
          <MenuItem onClick={handleUserMenuClose}>
            <PersonIcon sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleUserMenuClose}>
            <SettingsIcon sx={{ mr: 1 }} /> Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>

        <Box 
          sx={{ 
            position: 'sticky',
            top: 64,
            zIndex: 1,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            py: 1,
          }}
        >
          <Container maxWidth="xl">
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                px: { xs: 1, sm: 2 },
              }}
            >
              {[
                { label: 'Show All', value: 'all' },
                { label: 'Show Pending', value: 'pending' },
                { label: 'Show Completed', value: 'completed' },
              ].map(({ label, value }) => (
                <Button
                  key={value}
                  variant={filter === value ? 'contained' : 'outlined'}
                  onClick={() => setFilter(value)}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    boxShadow: filter === value ? 2 : 0,
                    '&:hover': {
                      boxShadow: filter === value ? 4 : 1,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {label}
                </Button>
              ))}
              <Tooltip title="Date Status Legend">
                <IconButton 
                  size="small"
                  sx={{ 
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Container>
        </Box>

        <Box 
          sx={{ 
            flex: 1,
            overflow: 'hidden',
            p: { xs: 1, sm: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {loading ? (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography>Loading tasks...</Typography>
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                minWidth: 300,
              }}
            >
              {error}
            </Alert>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: { xs: 2, sm: 3 },
                  height: '100%',
                  overflow: 'hidden',
                  alignItems: 'stretch',
                }}
              >
                {Object.entries(filteredTasks).map(([columnId, columnTasks]) => {
                  const columnTheme = getColumnTheme(columnId);
                  return (
                    <Paper
                      key={columnId}
                      elevation={0}
                      sx={{
                        p: 2,
                        backgroundColor: alpha(columnTheme.main, 0.1),
                        borderRadius: 4,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          backgroundColor: alpha(columnTheme.main, 0.15),
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.1)} 0%, transparent 100%)`,
                          pointerEvents: 'none',
                        },
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2, 
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1,
                        }}
                      >
                        {columnId.replace(/([A-Z])/g, ' $1').trim()}
                        <Chip 
                          label={columnTasks.length} 
                          size="small" 
                          sx={{ 
                            ml: 'auto',
                            backgroundColor: alpha(columnTheme.main, 0.15),
                            color: columnTheme.main,
                            fontWeight: 600,
                            border: `1px solid ${alpha(columnTheme.main, 0.3)}`,
                            '&:hover': {
                              backgroundColor: alpha(columnTheme.main, 0.25),
                            },
                            transition: 'all 0.2s ease-in-out',
                          }} 
                        />
                      </Typography>
                      <Droppable droppableId={columnId}>
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{ 
                              flex: 1,
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              px: 1,
                              mx: -1,
                              '&::-webkit-scrollbar': {
                                width: '8px',
                              },
                              '&::-webkit-scrollbar-track': {
                                backgroundColor: 'transparent',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                borderRadius: '4px',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                                },
                              },
                              minHeight: '100px',
                              transition: 'all 0.3s ease-in-out',
                              backgroundColor: snapshot.isDraggingOver 
                                ? alpha(theme.palette.primary.main, 0.05)
                                : 'transparent',
                              borderRadius: 2,
                              position: 'relative',
                              zIndex: snapshot.isDraggingOver ? 2 : 1,
                            }}
                          >
                            <AnimatePresence>
                              {columnTasks.map((task, index) => (
                                <motion.div
                                  key={task.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ duration: 0.2 }}
                                  style={{ zIndex: 1 }}
                                >
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                      <Paper
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        elevation={snapshot.isDragging ? 8 : 0}
                                        sx={{
                                          p: 2,
                                          mb: 2,
                                          backgroundColor: theme.palette.background.paper,
                                          borderRadius: 2,
                                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                          transition: 'all 0.3s ease-in-out',
                                          transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
                                          '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: 3,
                                            '& .task-actions': {
                                              opacity: 1,
                                            },
                                          },
                                          position: 'relative',
                                          '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: snapshot.isDragging
                                              ? `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`
                                              : 'none',
                                            borderRadius: 2,
                                            pointerEvents: 'none',
                                          },
                                          zIndex: snapshot.isDragging ? 3 : 1,
                                        }}
                                      >
                                        {editingTask?.id === task.id ? (
                                          <Box sx={{ p: 1 }}>
                                            <TextField
                                              fullWidth
                                              value={editingTask.title}
                                              onChange={(e) => setEditingTask({
                                                ...editingTask,
                                                title: e.target.value,
                                              })}
                                              sx={{ mb: 2 }}
                                            />
                                            <TextField
                                              fullWidth
                                              multiline
                                              rows={3}
                                              value={editingTask.description}
                                              onChange={(e) => setEditingTask({
                                                ...editingTask,
                                                description: e.target.value,
                                              })}
                                              sx={{ mb: 2 }}
                                            />
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                              <DatePicker
                                                value={editingTask.deadline}
                                                onChange={(newValue) => setEditingTask({
                                                  ...editingTask,
                                                  deadline: newValue,
                                                })}
                                                sx={{ width: '100%', mb: 2 }}
                                              />
                                            </LocalizationProvider>
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                              <Button
                                                onClick={() => setEditingTask(null)}
                                                variant="outlined"
                                                size="small"
                                              >
                                                Cancel
                                              </Button>
                                              <Button
                                                onClick={() => handleTaskUpdate(editingTask)}
                                                variant="contained"
                                                size="small"
                                              >
                                                Save
                                              </Button>
                                            </Box>
                                          </Box>
                                        ) : (
                                          <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                              <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                  fontWeight: 600,
                                                  fontSize: '1rem',
                                                }}
                                              >
                                                {task.title}
                                              </Typography>
                                              <Box
                                                className="task-actions"
                                                sx={{
                                                  opacity: 0,
                                                  transition: 'opacity 0.2s',
                                                  display: 'flex',
                                                  gap: 1,
                                                }}
                                              >
                                                <IconButton 
                                                  size="small"
                                                  onClick={() => handleEditTask(task)}
                                                  sx={{ 
                                                    color: theme.palette.primary.main,
                                                    '&:hover': {
                                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                    },
                                                  }}
                                                >
                                                  <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                  size="small"
                                                  onClick={() => handleDeleteTask(task)}
                                                  sx={{ 
                                                    color: theme.palette.error.main,
                                                    '&:hover': {
                                                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                    },
                                                  }}
                                                >
                                                  <DeleteIcon />
                                                </IconButton>
                                              </Box>
                                            </Box>
                                            <Typography 
                                              variant="body2" 
                                              color="text.secondary" 
                                              sx={{ 
                                                mt: 1,
                                                lineHeight: 1.5,
                                              }}
                                            >
                                              {task.description}
                                            </Typography>
                                            <Box 
                                              sx={{ 
                                                mt: 2, 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center' 
                                              }}
                                            >
                                              <Tooltip title={getStatusDescription(getStatusType(task.deadline, task.status))}>
                                                <Chip
                                                  label={task.deadline.toLocaleDateString()}
                                                  size="small"
                                                  sx={{
                                                    backgroundColor: getStatusColor(task.deadline, task.status),
                                                    color: 'white',
                                                    fontWeight: 500,
                                                    '& .MuiChip-label': {
                                                      px: 1,
                                                    },
                                                  }}
                                                />
                                              </Tooltip>
                                            </Box>
                                          </>
                                        )}
                                      </Paper>
                                    )}
                                  </Draggable>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </Paper>
                  );
                })}
              </Box>
            </DragDropContext>
          )}
        </Box>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Tooltip title="AI Assistant">
            <Fab
              color="primary"
              sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.primary.main,
                boxShadow: 3,
                width: 56,
                height: 56,
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: 6,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
              onClick={() => setIsAssistantOpen(true)}
            >
              <RobotIcon />
            </Fab>
          </Tooltip>
        </motion.div>

        <Modal
          open={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', maxWidth: 600 }}
          >
            <Paper
              sx={{
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: theme.shadows[24],
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RobotIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    AI Task Assistant 🤖
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setIsAssistantOpen(false)}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  minHeight: 300,
                  maxHeight: 'calc(90vh - 180px)',
                }}
              >
                {chatMessages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                      gap: 1,
                    }}
                  >
                    {message.type === 'assistant' && (
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 32,
                          height: 32,
                        }}
                      >
                        <RobotIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                    )}
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        backgroundColor: message.type === 'user'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.grey[500], 0.1),
                        borderRadius: 2,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 1,
                          color: theme.palette.text.secondary,
                          textAlign: message.type === 'user' ? 'right' : 'left',
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={assistantMessage}
                  onChange={(e) => setAssistantMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="How can I help you with your tasks?"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSendMessage}
                          disabled={!assistantMessage.trim()}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        </Modal>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <IconButton
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              backgroundColor: theme.palette.background.paper,
              boxShadow: 3,
              width: 56,
              height: 56,
              '&:hover': {
                backgroundColor: theme.palette.background.paper,
                boxShadow: 6,
                transform: 'scale(1.1) rotate(90deg)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
            onClick={() => setOpenDialog(true)}
          >
            <AddIcon />
          </IconButton>
        </motion.div>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add New Task
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Deadline"
                value={newTask.deadline}
                onChange={(newValue) => setNewTask({ ...newTask, deadline: newValue })}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddTask} 
              variant="contained"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Add Task
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={Boolean(deleteConfirmTask)}
          onClose={() => setDeleteConfirmTask(null)}
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this task? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setDeleteConfirmTask(null)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteTask}
              variant="contained"
              color="error"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Collapse in={Boolean(notification)}>
          <Alert
            severity="success"
            sx={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              minWidth: 300,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            {notification}
          </Alert>
        </Collapse>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard; 