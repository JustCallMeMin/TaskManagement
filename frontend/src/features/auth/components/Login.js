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
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { authService } from "../services/auth.service";
import TwoFactorAuth from "./TwoFactorAuth";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, API_URL } from "../../../shared/utils/constants";
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';

const schema = yup.object().shape({
	email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
	password: yup.string().required("Mật khẩu là bắt buộc"),
	twoFactorToken: yup.string().when("requiresTwoFactor", {
		is: true,
		then: (schema) => schema.required("Mã xác thực 2FA là bắt buộc"),
		otherwise: (schema) => schema.optional(),
	}),
});

const Login = () => {
	const navigate = useNavigate();
	const { login, verifySecurityCode } = useAuth();
	const [loading, setLoading] = useState(false);
	const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
	const [requiresSecurityVerification, setRequiresSecurityVerification] =
		useState(false);
	const [show2FA, setShow2FA] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		context: { requiresTwoFactor, requiresSecurityVerification },
	});

	const onSubmit = async (data) => {
		try {
			setLoading(true);

			if (requiresSecurityVerification) {
				await verifySecurityCode(data.securityCode);
				toast.success("Xác thực bảo mật thành công");
				navigate("/dashboard");
			} else {
				const response = await authService.login(data);

				if (response.requiresTwoFactor) {
					setRequiresTwoFactor(true);
					setShow2FA(true);
				} else {
					await login(response.token, response.user);
					toast.success(SUCCESS_MESSAGES.LOGIN);
					navigate("/dashboard");
				}
			}
		} catch (error) {
			if (error.message === "Yêu cầu xác thực bổ sung") {
				setRequiresSecurityVerification(true);
				toast.info("Vui lòng nhập mã xác thực bảo mật đã được gửi qua email");
			} else {
				toast.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
			}
		} finally {
			setLoading(false);
		}
	};

	const handle2FASuccess = () => {
		setShow2FA(false);
		navigate("/");
	};

	const handle2FACancel = () => {
		setShow2FA(false);
	};

	const handleOAuthLogin = (provider) => {
		window.location.href = `${API_URL}/auth/${provider}`;
	};

	if (show2FA) {
		return (
			<TwoFactorAuth onSuccess={handle2FASuccess} onCancel={handle2FACancel} />
		);
	}

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
							type="password"
							id="password"
							autoComplete="current-password"
							{...register("password")}
							error={!!errors.password}
							helperText={errors.password?.message}
						/>

						{requiresTwoFactor && (
							<TextField
								margin="normal"
								required
								fullWidth
								name="twoFactorToken"
								label="Mã xác thực 2FA"
								id="twoFactorToken"
								{...register("twoFactorToken")}
								error={!!errors.twoFactorToken}
								helperText={errors.twoFactorToken?.message}
							/>
						)}

						{requiresSecurityVerification && (
							<TextField
								margin="normal"
								required
								fullWidth
								name="securityCode"
								label="Mã xác thực bảo mật"
								id="securityCode"
								{...register("securityCode")}
								error={!!errors.securityCode}
								helperText={errors.securityCode?.message}
							/>
						)}

						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}>
							{loading ? <CircularProgress size={24} /> : "Đăng nhập"}
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
					</form>

					<Box mt={2} textAlign="center">
						<Link component={RouterLink} to="/register" variant="body2">
							Chưa có tài khoản? Đăng ký ngay
						</Link>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
};

export default Login;
