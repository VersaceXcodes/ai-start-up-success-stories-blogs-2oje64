import React from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from '@/store/main';

/* Import shared global views */
import GV_TopNav_Public from '@/components/views/GV_TopNav_Public';
import GV_Footer_Public from '@/components/views/GV_Footer_Public';
import GV_TopNav_Admin from '@/components/views/GV_TopNav_Admin';
import GV_AdminNav from '@/components/views/GV_AdminNav';
import GV_AdminFooter from '@/components/views/GV_AdminFooter';

/* Import unique views */
import UV_Homepage from '@/components/views/UV_Homepage';
import UV_BlogDetail from '@/components/views/UV_BlogDetail';
import UV_SearchResults from '@/components/views/UV_SearchResults';
import UV_FilteredPosts from '@/components/views/UV_FilteredPosts';
import UV_About from '@/components/views/UV_About';
import UV_Contact from '@/components/views/UV_Contact';
import UV_AdminLogin from '@/components/views/UV_AdminLogin';
import UV_AdminDashboard from '@/components/views/UV_AdminDashboard';
import UV_AdminPostEditor from '@/components/views/UV_AdminPostEditor';
import UV_AdminPostPreview from '@/components/views/UV_AdminPostPreview';

/* Layout component for public views */
const PublicLayout: React.FC = () => {
	return (
		<>
			<GV_TopNav_Public />
			<main className="min-h-screen pt-16 pb-8">
				{/* The Outlet renders the matched child route */}
				<Outlet />
			</main>
			<GV_Footer_Public />
		</>
	);
};

/* Layout component for admin views */
const AdminLayout: React.FC = () => {
	return (
		<div className="flex flex-col min-h-screen">
			<GV_TopNav_Admin />
			<div className="flex flex-1">
				<GV_AdminNav />
				<main className="flex-1 p-4">
					{/* The Outlet renders the matched admin child route */}
					<Outlet />
				</main>
			</div>
			<GV_AdminFooter />
		</div>
	);
};

/* Component to require admin authentication for protected admin routes */
const RequireAdminAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
	const isAuthenticated = useSelector((state: RootState) => state.auth_state.is_authenticated);
	if (!isAuthenticated) {
		// Redirect to admin login if not authenticated
		return <Navigate to="/admin/login" replace />;
	}
	return children;
};

/* Root App component */
const App: React.FC = () => {
	return (
		<Routes>
			{/* Public Routes */}
			<Route element={<PublicLayout />}>
				<Route path="/" element={<UV_Homepage />} />
				<Route path="/blog/:id" element={<UV_BlogDetail />} />
				<Route path="/search" element={<UV_SearchResults />} />
				<Route path="/filter" element={<UV_FilteredPosts />} />
				<Route path="/about" element={<UV_About />} />
				<Route path="/contact" element={<UV_Contact />} />
			</Route>
			
			{/* Admin Login (publicly accessible) */}
			<Route path="/admin/login" element={<UV_AdminLogin />} />
			
			{/* Protected Admin Routes */}
			<Route element={
				<RequireAdminAuth>
					<AdminLayout />
				</RequireAdminAuth>
			}>
				<Route path="/admin/dashboard" element={<UV_AdminDashboard />} />
				<Route path="/admin/posts/new" element={<UV_AdminPostEditor />} />
				<Route path="/admin/posts/:id/edit" element={<UV_AdminPostEditor />} />
				<Route path="/admin/posts/:id/preview" element={<UV_AdminPostPreview />} />
			</Route>
			
			{/* Fallback: Redirect unknown routes to the homepage */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
};

export default App;