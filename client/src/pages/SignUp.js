import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
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

export default function SignUp() {

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstname, setFisrtname] = React.useState('');
  const [lastname, setLastname] = React.useState('');

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [successSnackbarMessage, setSuccessSnackbarMessage] = useState('');
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSuccessSnackbarClose = () => {
    setOpenSuccessSnackbar(false);
    // Redirect to login page after the success Snackbar closes
    window.location = '/login';
  };

  const handleErrorSnackbarClose = () => {
    setOpenErrorSnackbar(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    setIsLoading(true); // Start loading

    const requestData = {
      firstname,
      lastname,
      username,
      password
    };
  
    try {
      const response = await axios.post('/register', requestData, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      const responseData = response.data;
      console.log(responseData);
      console.log(responseData.message);
      if (response.status === 201) {
        // Show success message in success Snackbar
        setSuccessSnackbarMessage('Registration successful');
        setOpenSuccessSnackbar(true);
      }
      
        
        
    } catch (error) {
      console.error('Error:', error);
      // Show the error message in the Snackbar
      setErrorSnackbarMessage(error.response.data.message);
      setOpenErrorSnackbar(true);
    }
    finally {
      setIsLoading(false); // Stop loading
    }
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
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  onChange={(e) => setFisrtname(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  onChange={(e) => setLastname(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Email Address"
                  name="username"
                  autoComplete="email"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>

              </Grid>
            </Grid>
            <Button
            // onClick={handleSubmit}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading} // Disable the button while loading
            >
             {isLoading ? 'Signing Up...' : 'Sign Up'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
              {/* Snackbar to display success status */}
      <Snackbar open={openSuccessSnackbar} autoHideDuration={3000} onClose={handleSuccessSnackbarClose}>
        <Alert onClose={handleSuccessSnackbarClose} severity="success">
          {successSnackbarMessage}
          . Redirecting to Login Page...
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
        {/* <Copyright sx={{ mt: 5 }} /> */}
       
      </Container>
    </ThemeProvider>
  );
}