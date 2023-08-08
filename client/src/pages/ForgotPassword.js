import * as React from 'react';
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

const defaultTheme=createTheme();

export default function ForgotPassword() {
    const handleSubmit = (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      console.log({
        email: data.get('email'),
      });
    };
    return (
        <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth='xs' >
        <CssBaseline/>
        <Box 
        sx={{
            marginTop: 8,
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
        }}
        >
            <Typography component='h1' variant='h5'>
                Forgot Password ?
            </Typography>
            <Box component='form' onSubmit={handleSubmit} noValidate sx={{mt:1}}>
                <TextField
                margin='normal'
                required
                fullWidth
                id='email'
                label='Email Address'
                autoComplete='email'
                autoFocus
                />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
                 Send OTP
            </Button>

            <Grid container>
              <Grid item xs>
                <Link href="/register" variant="body2">
                  Sign Up
                </Link>
              </Grid>
              <Grid item>
                <Link href="/login" variant="body2">
                  {"Sign In"}
                </Link>
              </Grid> 
            </Grid>

            </Box>
        </Box>
        </Container>
        </ThemeProvider>
    );
}