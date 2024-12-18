import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '@/redux/store';

function PrivateRoute() {
  const { currentUser } = useSelector((state: RootState) => state.user);

  // If there is no currentUser, redirect to the sign-in page
  return currentUser ? <Outlet /> : <Navigate to="/signin" />;
}

export default PrivateRoute;
