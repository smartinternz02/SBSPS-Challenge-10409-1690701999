import React from 'react'
import ResponsiveAppBar from './components/ResponsiveAppBar'
import { Button } from '@mui/material'

const handle = (()=>{
  <ResponsiveAppBar isLoggedIn={true} />
})

function Home() {
  return (
    <div>
      <Button onClick={handle}> Hi </Button>
      <ResponsiveAppBar isLoggedIn={true} />



    </div>
  )
}

export default Home