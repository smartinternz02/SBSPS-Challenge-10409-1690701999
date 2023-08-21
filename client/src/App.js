import SignIn from './pages/SignIn.js'
import SignUp from './pages/SignUp.js';
import Home from './pages/Home.js';
import HomePage from './pages/HomePage.js';
import ForgotPassword from './pages/ForgotPassword.js';
import StationPage from './pages/StationPage.js'
import React from 'react'
import {Routes,BrowserRouter,Route} from "react-router-dom"
import './App.css';

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' exact element={<Home/>} />
    <Route path='/charging-stations' exact element={<HomePage/>} />
    <Route path='/login' exact element={<SignIn/>} />
    <Route path='/register' exact element={<SignUp/>} />
    <Route path='/forgot-password' exact element={<ForgotPassword/>} />
    <Route path="/station/:id" component={StationPage} />
   </Routes>
   </BrowserRouter>
  );
}

export default App;
