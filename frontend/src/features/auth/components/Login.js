import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
	Box,
	Button,
	TextField,
	Typography,
	Container,
	Paper,
	CircularProgress,
	Link,
	Divider,
	Alert,
	InputAdornment,
	IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import { authService } from "../services/auth.service";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, API_URL } from "../../../shared/utils/constants";
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const schema = yup.object().shape({
	email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
	password: yup.string().required("Mật khẩu là bắt buộc"),
});

const Login = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema)
	});

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	const onSubmit = async (data) => {
		try {
			setLoading(true);
			setServerError("");

			const response = await authService.login(data);

			if (response.success) {
				toast.success(SUCCESS_MESSAGES.LOGIN);
				navigate("/dashboard");
			}

		} catch (error) {
			console.error("Login error:", error);
			
			if (error.response?.data?.error) {
				const errorMsg = error.response.data.error;
				
				// Map specific error messages to form fields
				if (errorMsg.includes("Email hoặc mật khẩu không đúng")) {
					// General credential error - could be either field
					setServerError("Email hoặc mật khẩu không đúng");
				} else if (errorMsg.includes("Tài khoản chưa được xác thực")) {
					setError("email", { 
						type: "manual", 
						message: "Tài khoản chưa được xác thực email" 
					});
				} else if (errorMsg.includes("Tài khoản đã bị khóa")) {
					setServerError("Tài khoản của bạn đã bị khóa");
				} else {
					// General server error
					setServerError(errorMsg);
				}
			} else if (error.response?.data?.message) {
				setServerError(error.response.data.message);
			} else if (error.message) {
				setServerError(error.message);
			} else {
				setServerError(ERROR_MESSAGES.SERVER_ERROR);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleOAuthLogin = (provider) => {
		window.location.href = `${API_URL}/auth/${provider}`;
	};

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}>
				<Paper elevation={3} sx={{ p: 4, width: "100%" }}>
					<Typography component="h1" variant="h5" align="center" gutterBottom>
						Đăng nhập
					</Typography>

					{serverError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{serverError}
						</Alert>
					)}

					<form onSubmit={handleSubmit(onSubmit)}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email"
							name="email"
							autoComplete="email"
							autoFocus
							{...register("email")}
							error={!!errors.email}
							helperText={errors.email?.message}
						/>

						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Mật khẩu"
							type={showPassword ? "text" : "password"}
							id="password"
							autoComplete="current-password"
							{...register("password")}
							error={!!errors.password}
							helperText={errors.password?.message}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton onClick={togglePasswordVisibility}>
											{showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}
							>
							{loading ? (
								<CircularProgress size={24} />
							) : (
								"Đăng nhập"
							)}
						</Button>

						<Divider sx={{ my: 2 }}>hoặc</Divider>
						
						<Button
							fullWidth
							variant="outlined"
							startIcon={<GoogleIcon />}
							onClick={() => handleOAuthLogin('google')}
							sx={{ mb: 1 }}
						>
							Đăng nhập với Google
						</Button>
						
						<Button
							fullWidth
							variant="outlined"
							startIcon={<GitHubIcon />}
							onClick={() => handleOAuthLogin('github')}
							sx={{ mb: 2 }}
						>
							Đăng nhập với GitHub
						</Button>

						<Box sx={{ mt: 2, textAlign: "center" }}>
							<Link component={RouterLink} to="/register" variant="body2">
								Chưa có tài khoản? Đăng ký
							</Link>
						</Box>
					</form>
				</Paper>
			</Box>
		</Container>
	);
};

export default Login;
