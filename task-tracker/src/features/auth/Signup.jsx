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
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Apple as AppleIcon,
  GitHub as GitHubIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import GroupIcon from '@mui/icons-material/Group';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

// Accent colors
const ACCENT_GREEN = '#baff5e';
const ACCENT_PURPLE = '#a18fff';
const ACCENT_ORANGE = '#ffb86b';
const ACCENT_BLUE = '#6ec1e4';
const BG_DARK = '#181a1b';
const GLASS_BG = 'rgba(32, 34, 40, 0.85)';
const SOFT_TEXT = '#e0e0e0';
const SOFT_LABEL = '#b0b0b0';

// Animated dots for glass background
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
    background: provider === 'google' ? '#2d3e2e' : provider === 'apple' ? '#23223a' : provider === 'github' ? '#2d2323' : '#232323',
    boxShadow: `0 0 12px 2px ${ACCENT_GREEN}40`,
    transform: 'scale(1.03)',
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

const FeatureGlass = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
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

const InfoLink = styled(Link)(({ theme }) => ({
  color: ACCENT_GREEN,
  textDecoration: 'underline',
  fontWeight: 500,
  transition: 'color 0.2s',
  '&:hover': {
    color: ACCENT_ORANGE,
    textDecoration: 'underline',
  },
}));

const DummyAdornment = (
  <InputAdornment position="end" sx={{ visibility: 'hidden' }}>
    <IconButton tabIndex={-1} />
  </InputAdornment>
);

const SOCIALS = [
  {
    label: 'Continue with Google',
    icon: <GoogleIcon style={{ fontSize: 32 }} />,
    color: '#34a853',
    onClick: () => window.location.href = '/login/google'
  },
  {
    label: 'Continue with Apple',
    icon: <AppleIcon style={{ fontSize: 32 }} />,
    color: '#a18fff',
    onClick: () => window.location.href = '/login/apple'
  },
  {
    label: 'Continue with Github',
    icon: <GitHubIcon style={{ fontSize: 32 }} />,
    color: '#ffb86b',
    onClick: () => window.location.href = '/login/github'
  }
];

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
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
        {/* Left: Signup */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', px: { xs: 2, md: '6vw' }, py: 'clamp(2rem, 6vw, 6rem)', minWidth: 0, width: '100%' }}>
          <Box sx={{ width: '100%', maxWidth: '600px', minWidth: 0 }}>
            <Typography variant="h2" fontWeight={800} mb={2} sx={{ color: '#fff', lineHeight: 1.1, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              Start collaborating<br />in less than 30 seconds. <Box component="span" sx={{ color: ACCENT_ORANGE, fontSize: 'clamp(2rem, 4vw, 3rem)', verticalAlign: 'middle' }}>⚡</Box>
            </Typography>
            <form onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Last Name (optional)"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="johndoe@mail.com"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                  <StyledTextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: SOFT_LABEL, ml: 1 }}
                    tabIndex={-1}
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Grid>
                <Grid item xs={12}>
                  <NeonButton fullWidth size="large" type="submit">
                    Create My Account
                  </NeonButton>
                </Grid>
              </Grid>
            </form>
            {/* Info Row: Terms and Login */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
              sx={{
                mt: 3,
                mb: 1,
                fontSize: 'clamp(0.95rem, 1vw, 1.1rem)',
                color: SOFT_LABEL,
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              <span>
                By registering, you agree to our{' '}
                <Link href="/terms" target="_blank" rel="noopener" sx={{ color: ACCENT_GREEN, fontWeight: 600 }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" rel="noopener" sx={{ color: ACCENT_GREEN, fontWeight: 600 }}>Privacy Policy</Link>.
              </span>
              <span>
                Already registered?{' '}
                <Link href="/login" sx={{ color: ACCENT_ORANGE, fontWeight: 600 }}>Login</Link>
              </span>
            </Stack>
            <Divider sx={{ my: 2, borderColor: '#232323', color: SOFT_LABEL }}>Or continue with</Divider>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <SocialButton provider="google" startIcon={<GoogleIcon style={{ fontSize: 40, marginRight: 16 }} />} onClick={() => window.location.href = '/login/google'}>
                Continue with Google
              </SocialButton>
              <SocialButton provider="apple" startIcon={<AppleIcon style={{ fontSize: 40, marginRight: 16 }} />} onClick={() => window.location.href = '/login/apple'}>
                Continue with Apple
              </SocialButton>
              <SocialButton provider="github" startIcon={<GitHubIcon style={{ fontSize: 40, marginRight: 20,marginLeft: 4 }} />} onClick={() => window.location.href = '/login/github'}>
                Continue with Github
              </SocialButton>
            </Stack>
          </Box>
        </Box>
        {/* Right: Feature Glass Section */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, md: '6vw' }, py: 'clamp(2rem, 6vw, 6rem)', minWidth: 0, width: '100%' }}>
          <FeatureGlass sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(40,42,50,0.5)', borderRadius: 2, p: 3, boxShadow: '0 2px 8px 0 #0002' }}>
                <AutoAwesomeMotionIcon sx={{ fontSize: 38, color: '#a18fff', bgcolor: 'rgba(161,143,255,0.12)', borderRadius: 2, p: 1 }} />
                <Box>
                  <Typography fontWeight={700} color="#fff" fontSize={20}>Boost Your Productivity</Typography>
                  <Typography variant="body2" color={SOFT_LABEL} sx={{ opacity: 0.9 }}>
                    Manage tasks smarter and faster. Start organizing your work like a pro.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(40,42,50,0.5)', borderRadius: 2, p: 3, boxShadow: '0 2px 8px 0 #0002' }}>
                <LockOpenIcon sx={{ fontSize: 38, color: '#6ec1e4', bgcolor: 'rgba(110,193,228,0.12)', borderRadius: 2, p: 1 }} />
                <Box>
                  <Typography fontWeight={700} color="#fff" fontSize={20}>Sign Up Your Way</Typography>
                  <Typography variant="body2" color={SOFT_LABEL} sx={{ opacity: 0.9 }}>
                    Quick sign-up with email or social media. Your productivity starts here.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(40,42,50,0.5)', borderRadius: 2, p: 3, boxShadow: '0 2px 8px 0 #0002' }}>
                <BusinessCenterIcon sx={{ fontSize: 38, color: '#ffb86b', bgcolor: 'rgba(255,184,107,0.12)', borderRadius: 2, p: 1 }} />
                <Box>
                  <Typography fontWeight={700} color="#fff" fontSize={20}>Plans for Every Team</Typography>
                  <Typography variant="body2" color={SOFT_LABEL} sx={{ opacity: 0.9 }}>
                    Free plan available. Upgrade anytime to increase active tasks and unlock more features.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(40,42,50,0.5)', borderRadius: 2, p: 3, boxShadow: '0 2px 8px 0 #0002' }}>
                <GroupIcon sx={{ fontSize: 38, color: '#baff5e', bgcolor: 'rgba(186,255,94,0.12)', borderRadius: 2, p: 1 }} />
                <Box>
                  <Typography fontWeight={700} color="#fff" fontSize={20}>Ideal for Teams</Typography>
                  <Typography variant="body2" color={SOFT_LABEL} sx={{ opacity: 0.9 }}>
                    Collaborate in real-time, comment on tasks, and move faster together.
                  </Typography>
                </Box>
              </Box>
            </Stack>
            <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.85 }}>
              <Typography variant="body2" color={SOFT_LABEL}>
                Want more power?{' '}
                <Link href="/plans" sx={{ color: '#6ec1e4', fontWeight: 600, textDecoration: 'underline', transition: 'color 0.2s', '&:hover': { color: '#a18fff' } }}>
                  Check our plans here
                </Link>
              </Typography>
            </Box>
          </FeatureGlass>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
