import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Link,
  IconButton,
  InputAdornment,
  Grid,
  Stack,
  AppBar,
  Toolbar,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import GroupIcon from '@mui/icons-material/Group';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider 
} from 'firebase/auth';
import { auth } from '../../services/firebase';

const ACCENT_GREEN = '#baff5e';
const ACCENT_PURPLE = '#a18fff';
const ACCENT_ORANGE = '#ffb86b';
const ACCENT_BLUE = '#6ec1e4';
const BG_DARK = '#181a1b';
const GLASS_BG = 'rgba(32, 34, 40, 0.85)';
const SOFT_TEXT = '#e0e0e0';
const SOFT_LABEL = '#b0b0b0';

const float = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 0.7; }
`;
const AnimatedDot = styled('div')(({ color, top, left, size, duration }) => ({
  position: 'absolute',
  top,
  left,
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  opacity: 0.18,
  filter: 'blur(1.5px)',
  animation: `${float} ${duration}s ease-in-out infinite`,
}));

const TopBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(24,26,27,0.85)',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  backdropFilter: 'blur(8px)',
  zIndex: 10,
}));

const Logo = styled('div')(() => ({
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 800,
  fontSize: 'clamp(1.5rem, 2vw, 2.5rem)',
  color: ACCENT_PURPLE,
  letterSpacing: 1.5,
  opacity: 0.95,
  flex: 1,
}));

const NeonButton = styled(Button)(({ theme }) => ({
  background: ACCENT_GREEN,
  color: '#181a1b',
  fontWeight: 700,
  fontSize: 'clamp(1rem, 1.2vw, 1.25rem)',
  borderRadius: 8,
  boxShadow: `0 0 12px 0 ${ACCENT_GREEN}80` ,
  transition: 'all 0.2s',
  '&:hover, &:focus': {
    background: '#aaff39',
    boxShadow: `0 0 24px 2px ${ACCENT_GREEN}`,
    transform: 'translateY(-2px) scale(1.01)',
  },
}));

const SocialButton = styled(Button)(({ theme, provider }) => ({
  flex: 1,
  minWidth: 0,
  color: '#fff',
  borderRadius: 10,
  fontWeight: 600,
  background: '#232323',
  border: '1.5px solid #232323',
  margin: theme.spacing(0.5),
  padding: theme.spacing(1.4, 0),
  transition: 'all 0.2s',
  fontSize: 'clamp(1rem, 1.1vw, 1.15rem)',
  letterSpacing: 0.2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  boxShadow: '0 2px 8px 0 #0002',
  '&:hover, &:focus': {
    background: provider === 'google' ? '#2d3e2e' : provider === 'github' ? '#2d2323' : '#232323',
    boxShadow: `0 0 12px 2px ${ACCENT_GREEN}40`,
    transform: 'scale(1.03)',
  },
  '& .MuiButton-startIcon': {
    color:
      provider === 'google' ? '#34a853' :
      provider === 'github' ? '#ffb86b' : ACCENT_GREEN,
    fontSize: 40,
    marginRight: 16,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    background: '#232323',
    color: SOFT_TEXT,
    border: '1px solid #232323',
    fontSize: 'clamp(1rem, 1.1vw, 1.2rem)',
    '& input': {
      color: SOFT_TEXT,
    },
    '& fieldset': {
      borderColor: '#232323',
    },
    '&:hover fieldset': {
      borderColor: ACCENT_GREEN,
    },
    '&.Mui-focused fieldset': {
      borderColor: ACCENT_GREEN,
      boxShadow: `0 0 0 2px ${ACCENT_GREEN}40`,
    },
  },
  '& .MuiInputLabel-root': {
    color: SOFT_LABEL,
    fontSize: 'clamp(0.95rem, 1vw, 1.1rem)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: ACCENT_GREEN,
  },
}));

const FeatureGlass = styled(Box)(({ theme }) => ({
  background: GLASS_BG,
  borderRadius: '2.5rem',
  boxShadow: '0 8px 40px 0 rgba(0,0,0,0.45)',
  backdropFilter: 'blur(18px)',
  border: '1.5px solid rgba(255,255,255,0.06)',
  color: '#fff',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: '100%',
  height: 'auto',
  maxHeight: '90vh',
  position: 'relative',
  overflow: 'hidden',
  padding: 'clamp(2rem, 6vw, 6rem) clamp(1.5rem, 4vw, 4rem)',
  margin: 'auto',
  alignSelf: 'center',
  boxShadow: '0 8px 40px 0 rgba(0,0,0,0.45), 0 1.5px 8px 0 #232323',
}));

const FeatureBox = styled(Box)(({ theme, accent }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  background: 'rgba(40, 42, 50, 0.5)',
  borderRadius: 16,
  padding: 'clamp(1rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem)',
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 8px 0 #0002',
  '& .feature-icon': {
    color: accent,
    fontSize: 'clamp(2rem, 2.5vw, 2.5rem)',
    marginTop: 2,
  },
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  margin: `${theme.spacing(2)} 0 ${theme.spacing(1)} 0`,
  padding: `${theme.spacing(1)} 0`,
  borderRadius: 8,
  background: 'rgba(40, 42, 50, 0.25)',
  fontSize: 'clamp(0.95rem, 1vw, 1.1rem)',
}));

const InfoText = styled(Typography)(({ theme }) => ({
  color: SOFT_LABEL,
  fontSize: 'clamp(0.95rem, 1vw, 1.1rem)',
  fontWeight: 400,
  lineHeight: 1.5,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}));

const InfoLink = styled(Link)(({ theme, provider }) => ({
  color: provider === 'google' ? '#34a853' : provider === 'github' ? '#ffb86b' : ACCENT_GREEN,
  textDecoration: 'underline',
  fontWeight: 500,
  transition: 'color 0.2s',
  '&:hover': {
    color: provider === 'google' ? '#2d3e2e' : provider === 'github' ? '#ffa94d' : ACCENT_ORANGE,
    textDecoration: 'underline',
  },
}));

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError('The username or password is wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError(null);
    setLoading(true);

    try {
      const authProvider = provider === 'google' 
        ? new GoogleAuthProvider() 
        : new GithubAuthProvider();

      await signInWithPopup(auth, authProvider);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, minHeight: '100vh', width: '100vw', bgcolor: BG_DARK, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9999 }}>
      {/* Top Bar */}
      <TopBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: 'clamp(56px, 7vw, 80px)', px: { xs: 2, md: 8 } }}>
          <Logo>TaskNest</Logo>
        </Toolbar>
      </TopBar>
      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 'calc(100vh - clamp(56px, 7vw, 80px))' }}>
        {/* Left: Login */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', px: { xs: 2, md: '6vw' }, py: 'clamp(2rem, 6vw, 6rem)', minWidth: 0, width: '100%' }}>
          <Box sx={{ width: '100%', maxWidth: '600px', minWidth: 0 }}>
            <Typography variant="h2" fontWeight={800} mb={2} sx={{ color: '#fff', lineHeight: 1.1, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              Welcome back<br />to <Box component="span" sx={{ color: ACCENT_PURPLE, fontWeight: 900 }}>TaskNest</Box>
            </Typography>
            <form onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="johndoe@mail.com"
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: SOFT_LABEL }}
                            disabled={loading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link href="#" sx={{ color: ACCENT_GREEN, fontWeight: 500, fontSize: 'clamp(0.95rem, 1vw, 1.1rem)' }}>
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item xs={12}>
                  <NeonButton 
                    fullWidth 
                    size="large" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </NeonButton>
                </Grid>
              </Grid>
            </form>
            {/* Info Row: Create Account */}
            <InfoRow>
              <InfoText>
                Don&apos;t have an account?
                <InfoLink href="/signup" provider="google">Create one</InfoLink>
              </InfoText>
            </InfoRow>
            <Divider sx={{ my: 2, borderColor: '#232323', color: SOFT_LABEL }}>Or continue with</Divider>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <SocialButton 
                provider="google" 
                startIcon={<GoogleIcon style={{ fontSize: 40, marginRight: 16 }} />} 
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                Continue with Google
              </SocialButton>
              <SocialButton 
                provider="github" 
                startIcon={<GitHubIcon style={{ fontSize: 40, marginRight: 16 }} />} 
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
              >
                Continue with Github
              </SocialButton>
            </Stack>
          </Box>
        </Box>
        {/* Right: Feature Glass Section */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, md: '6vw' }, py: 'clamp(2rem, 6vw, 6rem)', minWidth: 0, width: '100%' }}>
          <FeatureGlass>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(40,42,50,0.5)', borderRadius: 2, p: 3, boxShadow: '0 2px 8px 0 #0002' }}>
                <DashboardCustomizeIcon sx={{ fontSize: 38, color: '#6ec1e4', bgcolor: 'rgba(110,193,228,0.12)', borderRadius: 2, p: 1 }} />
                <Box>
                  <Typography fontWeight={700} color="#fff" fontSize={20}>Organize Your Workflow</Typography>
                  <Typography variant="body2" color={SOFT_LABEL} sx={{ opacity: 0.9 }}>
                    Create boards, columns, and tasks with ease. Track everything from idea to completion.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(40,42,50,0.5)', borderRadius: 2, p: 3, boxShadow: '0 2px 8px 0 #0002' }}>
                <GroupIcon sx={{ fontSize: 38, color: '#baff5e', bgcolor: 'rgba(186,255,94,0.12)', borderRadius: 2, p: 1 }} />
                <Box>
                  <Typography fontWeight={700} color="#fff" fontSize={20}>Stay on Track</Typography>
                  <Typography variant="body2" color={SOFT_LABEL} sx={{ opacity: 0.9 }}>
                    Mark tasks as done, filter by status (All, Pending, Completed), and always know what's next.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(40,42,50,0.5)', borderRadius: 2, p: 3, boxShadow: '0 2px 8px 0 #0002' }}>
                <AutoAwesomeMotionIcon sx={{ fontSize: 38, color: '#a18fff', bgcolor: 'rgba(161,143,255,0.12)', borderRadius: 2, p: 1 }} />
                <Box>
                  <Typography fontWeight={700} color="#fff" fontSize={20}>Built-in AI Assistant</Typography>
                  <Typography variant="body2" color={SOFT_LABEL} sx={{ opacity: 0.9 }}>
                    Use text or voice commands to create and manage tasks. Save time, stay focused.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(40,42,50,0.5)', borderRadius: 2, p: 3, boxShadow: '0 2px 8px 0 #0002' }}>
                <DashboardCustomizeIcon sx={{ fontSize: 38, color: '#ffb86b', bgcolor: 'rgba(255,184,107,0.12)', borderRadius: 2, p: 1, transform: 'rotate(45deg)' }} />
                <Box>
                  <Typography fontWeight={700} color="#fff" fontSize={20}>Smart Task Cards</Typography>
                  <Typography variant="body2" color={SOFT_LABEL} sx={{ opacity: 0.9 }}>
                    Task cards are auto-colored based on deadlines: early, due soon, late, or done.
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </FeatureGlass>
        </Box>
      </Box>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%', bgcolor: '#232323', color: '#fff', '& .MuiAlert-icon': { color: '#ff6b6b' } }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login; 