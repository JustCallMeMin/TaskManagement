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
	Alert,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

const schema = yup.object().shape({
	firstName: yup.string().required("Họ là bắt buộc"),
	lastName: yup.string().required("Tên là bắt buộc"),
	email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
	password: yup
		.string()
		.required("Mật khẩu là bắt buộc")
		.min(8, "Mật khẩu phải có ít nhất 8 ký tự")
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
			"Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
		),
	confirmPassword: yup
		.string()
		.required("Xác nhận mật khẩu là bắt buộc")
		.oneOf([yup.ref("password")], "Mật khẩu không khớp"),
	phone: yup
		.string()
		.matches(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
});

const Register = () => {
	const navigate = useNavigate();
	const { register: registerUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState("");
	const [serverFieldErrors, setServerFieldErrors] = useState({});

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		mode: "onChange",
	});

	const onSubmit = async (data) => {
		try {
			setLoading(true);
			setServerError("");
			setServerFieldErrors({});
			
			// Combine firstName and lastName into fullName
			const userData = {
				...data,
				fullName: `${data.firstName} ${data.lastName}`
			};
			// Remove firstName and lastName as they're not needed by the backend
			delete userData.firstName;
			delete userData.lastName;
			
			await registerUser(userData);
			toast.success(
				"Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản."
			);
			navigate("/login");
		} catch (error) {
			console.error("Registration error:", error);
			
			// Handle different error formats for server-side validation
			if (error.response?.data?.error) {
				const errorMsg = error.response.data.error;
				
				// Check for specific field errors
				if (errorMsg.includes("Email đã được sử dụng")) {
					setError("email", { 
						type: "manual", 
						message: "Email đã được sử dụng" 
					});
				} else if (errorMsg.includes("Số điện thoại không hợp lệ")) {
					setError("phone", { 
						type: "manual", 
						message: "Số điện thoại không hợp lệ" 
					});
				} else {
					// General error not specific to a field
					setServerError(errorMsg);
				}
			} else if (error.message) {
				setServerError(error.message);
			} else {
				setServerError("Đăng ký thất bại. Vui lòng thử lại sau.");
			}
		} finally {
			setLoading(false);
		}
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
						Đăng ký tài khoản
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
							id="firstName"
							label="Họ"
							name="firstName"
							autoComplete="given-name"
							autoFocus
							{...register("firstName")}
							error={!!errors.firstName}
							helperText={errors.firstName?.message}
						/>

						<TextField
							margin="normal"
							required
							fullWidth
							id="lastName"
							label="Tên"
							name="lastName"
							autoComplete="family-name"
							{...register("lastName")}
							error={!!errors.lastName}
							helperText={errors.lastName?.message}
						/>

						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email"
							name="email"
							autoComplete="email"
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
							autoComplete="new-password"
							{...register("password")}
							error={!!errors.password}
							helperText={errors.password?.message}
						/>

						<TextField
							margin="normal"
							required
							fullWidth
							name="confirmPassword"
							label="Xác nhận mật khẩu"
							type="password"
							id="confirmPassword"
							{...register("confirmPassword")}
							error={!!errors.confirmPassword}
							helperText={errors.confirmPassword?.message}
						/>

						<TextField
							margin="normal"
							fullWidth
							name="phone"
							label="Số điện thoại"
							type="tel"
							id="phone"
							{...register("phone")}
							error={false}
							helperText={null}
							sx={{
								'& .MuiOutlinedInput-root': {
									...(errors.phone ? {
										'& fieldset': {
											borderColor: 'error.main',
										},
										'&:hover fieldset': {
											borderColor: 'error.main',
										},
										'&.Mui-focused fieldset': {
											borderColor: 'error.main',
										},
									} : {})
								}
							}}
						/>
						{errors.phone && (
							<Typography 
								color="error" 
								variant="caption" 
								sx={{ 
									display: 'block', 
									mt: 0.5,
									mb: 1,
									textAlign: 'left',
									pl: 1.5,
									fontSize: '0.75rem',
									fontWeight: 400,
									lineHeight: 1.66,
									letterSpacing: '0.03333em',
								}}
							>
								{errors.phone.message}
							</Typography>
						)}

						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}>
							{loading ? <CircularProgress size={24} /> : "Đăng ký"}
						</Button>

						<Box sx={{ textAlign: "center" }}>
							<Link component={RouterLink} to="/login" variant="body2">
								Đã có tài khoản? Đăng nhập
							</Link>
						</Box>
					</form>
				</Paper>
			</Box>
		</Container>
	);
};

export default Register;
