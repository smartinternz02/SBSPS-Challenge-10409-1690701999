import { Alert, AlertTitle } from '@mui/material'
import React from 'react'

function Home() {
  return (
   
    <Alert autoHideDuration={6000} severity='success'>
    <AlertTitle>Success</AlertTitle>
    Login Successfully
  </Alert>
  )
} 

export default Home