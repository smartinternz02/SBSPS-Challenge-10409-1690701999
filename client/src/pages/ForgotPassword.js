import * as React from 'react';
import { Avatar, Button, CssBaseline, TextField, FormControlLabel,Checkbox, Link, Grid, Box, Container, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ResponsiveAppBar from './components/ResponsiveAppBar'

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
          <ResponsiveAppBar/>
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

// import React, { Component } from 'react';
// import { TextField, Button } from '@mui/material';

// class ForgotPassword extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       email: '',
//       step: 1, // Step 1: Requesting OTP, Step 2: Verifying OTP
//       otp: '', // To store the entered OTP
//     };
//   }

//   // Your existing code for handling email submission

//   sendOTP = () => {
//     // Generate and send OTP to the user's email or phone
//     // Update the state accordingly
//     this.setState({ step: 2 });
//   };

//   verifyOTP = () => {
//     // Verify the entered OTP
//     // If OTP is correct, proceed with password reset
//     // If OTP is incorrect, display an error message
//   };

//   render() {
//     return (
//       <div>
//         {this.state.step === 1 ? (
//           // Step 1: Requesting OTP
//           <div>
//             <h2>Forgot Password</h2>
//             <p>Enter your email to reset your password.</p>
//             <TextField
//               label="Email"
//               variant="outlined"
//               value={this.state.email}
//               onChange={(e) => this.setState({ email: e.target.value })}
//             />
//             <Button variant="contained" color="primary" onClick={this.sendOTP}>
//               Submit
//             </Button>
//           </div>
//         ) : (
//           // Step 2: Verifying OTP
//           <div>
//             <h2>OTP Verification</h2>
//             <p>Enter the OTP sent to your email/phone:</p>
//             <TextField
//               label="Enter OTP"
//               variant="outlined"
//               value={this.state.otp}
//               onChange={(e) => this.setState({ otp: e.target.value })}
//             />
//             <Button variant="contained" color="primary" onClick={this.verifyOTP}>
//               Verify OTP
//             </Button>
//           </div>
//         )}
//       </div>
//     );
//   }
// }

// export default ForgotPassword;
