import SignIn from './pages/SignIn.js'
import SignUp from './pages/SignUp.js';
import {Routes,BrowserRouter,Route} from "react-router-dom"
import './App.css';

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' exact element={<SignIn/>} />
    <Route path='/register' exact element={<SignUp/>} />
   </Routes>
   </BrowserRouter>
  );
}

export default App;
