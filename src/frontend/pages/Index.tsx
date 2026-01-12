import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to the operational dashboard
  return <Navigate to="/operation" replace />;
};

export default Index;
