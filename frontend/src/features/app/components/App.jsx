import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../../../shared/utils/theme";
import MainLayout from "../../../layouts/MainLayout";
import Dashboard from "../../dashboard/components/Dashboard";
import { AuthProvider } from "../../auth/contexts/AuthContext";

// Task components
import TaskList from "../../tasks/components/TaskList";
import TaskForm from "../../tasks/components/TaskForm";

const App = () => {
	return (
		<Router>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<AuthProvider>
					<MainLayout>
						<Routes>
							<Route path="/" element={<Dashboard />} />
							<Route path="/tasks" element={<TaskList />} />
							<Route path="/tasks/new" element={<TaskForm />} />
							<Route path="/tasks/:id/edit" element={<TaskForm />} />
						</Routes>
					</MainLayout>
				</AuthProvider>
			</ThemeProvider>
		</Router>
	);
};

export default App;
