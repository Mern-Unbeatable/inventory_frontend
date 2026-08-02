import { Navigate } from 'react-router-dom';

/** Legacy route — password settings now live on the Profile page. */
export default function SettingsPage() {
  return <Navigate to='/profile?tab=password' replace />;
}
