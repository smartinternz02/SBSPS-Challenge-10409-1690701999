import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignIn() {

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [successSnackbarMessage, setSuccessSnackbarMessage] = useState('');
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);


  const handleSuccessSnackbarClose = () => {
    setOpenSuccessSnackbar(false);
    // Redirect to login page after the success Snackbar closes
    window.location = '/charging-stations';
  };

  const handleErrorSnackbarClose = () => {
    setOpenErrorSnackbar(false);
  };

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   const requestOptions = {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ username, password }),
  //   };
  //   fetch('/login', requestOptions)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data);
  //       console.log(data.message);
  //     })
  //     .catch((error) => {
        
  //       console.error('Error:', error);
  //     });
  // };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true); // Start loading
    axios.post('/login', { username, password }, { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        console.log(response.data);
        if (response.status === 200) {
          // Show success message in success Snackbar
          setSuccessSnackbarMessage('Login successful');
          setOpenSuccessSnackbar(true);
          setIsLoading(false); // Stop loading
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        // Show the error message in the Snackbar
      setErrorSnackbarMessage(error.response.data.message);
      setOpenErrorSnackbar(true);
      setIsLoading(false); // Stop loading
      }
      
      );
      
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
            // onClick={handleSubmit}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading} // Disable the button while loading
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
            {/* Snackbar to display success status */}
      <Snackbar open={openSuccessSnackbar} autoHideDuration={3000} onClose={handleSuccessSnackbarClose}>
        <Alert onClose={handleSuccessSnackbarClose} severity="success">
          {successSnackbarMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar to display error status */}
      <Snackbar open={openErrorSnackbar} autoHideDuration={6000} onClose={handleErrorSnackbarClose}>
        <Alert onClose={handleErrorSnackbarClose} severity="error">
          {errorSnackbarMessage}
        </Alert>
      </Snackbar>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}