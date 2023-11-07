import { Route, Routes } from 'react-router-dom';
// Pages
import HomePage from './pages/home/HomePage';
import LoginPage from './users/login/LoginPage';
import RegisterPage from './users/register/RegisterPage';
import TestPage from './pages/test/TestPage';
import Error404 from './pages/error/Error404';

function App() {
  return (
    <Routes>
      <Route path='/' index element={<HomePage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/sign-up' element={<RegisterPage />} />
      <Route path='/test' element={<TestPage />} />
      <Route path='*' element={<Error404 />} />
    </Routes>
  );
}

export default App;
