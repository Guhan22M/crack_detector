import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import GoogleSuccess from './pages/GoogleSuccess';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path='/' element={< AuthPage />} />
        <Route path='/google-success' element={<GoogleSuccess/>} />
        <Route element={<ProtectedRoute/>}>
          <Route path='/home' element={<Home/>} />
          <Route path='/history' element={<History/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
