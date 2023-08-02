import SignIn from './pages/SignIn.js'
import SignUp from './pages/SignUp.js';
import ForgotPassword from './pages/ForgotPassword.js';
import React, {useState, useEffect} from 'react'
import {Routes,BrowserRouter,Route} from "react-router-dom"
import './App.css';

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' exact element={<SignIn/>} />
    <Route path='/register' exact element={<SignUp/>} />
    <Route path='/forgot-password' exact element={<ForgotPassword/>} />
   </Routes>
   </BrowserRouter>
  );
}

export default App;
