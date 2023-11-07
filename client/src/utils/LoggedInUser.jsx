import { jwtDecode } from 'jwt-decode';

export default function LoggedInUser() {
  const loadedToken = localStorage.getItem('token');
  if (loadedToken === null || loadedToken === '') {
    return null;
  }

  const decoded = jwtDecode(loadedToken);

  return decoded;
}
