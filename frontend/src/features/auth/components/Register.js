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
	phone: yup.string().matches(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
});

const Register = () => {
	const navigate = useNavigate();
	const { register: registerUser } = useAuth();
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const onSubmit = async (data) => {
		try {
			setLoading(true);
			await registerUser(data);
			toast.success(
				"Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản."
			);
			navigate("/login");
		} catch (error) {
			toast.error(error.message || "Đăng ký thất bại");
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
							error={!!errors.phone}
							helperText={errors.phone?.message}
						/>

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
