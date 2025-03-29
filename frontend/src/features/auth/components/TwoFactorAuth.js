import React, { useState, useEffect } from "react";
import {
	Box,
	Paper,
	Typography,
	TextField,
	Button,
	CircularProgress,
	Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { authService } from "../services/auth.service";
import { QRCodeSVG } from "qrcode.react";

const schema = yup.object().shape({
	token: yup
		.string()
		.required("Vui lòng nhập mã xác thực")
		.matches(/^\d{6}$/, "Mã xác thực phải có 6 chữ số"),
});

const TwoFactorAuth = ({ onSuccess, onCancel }) => {
	const [loading, setLoading] = useState(false);
	const [qrCode, setQrCode] = useState(null);
	const [secret, setSecret] = useState(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

	// Tạo mã 2FA khi component mount
	useEffect(() => {
		const generate2FA = async () => {
			try {
				setLoading(true);
				const response = await authService.generate2FA();
				setQrCode(response.qrCode);
				setSecret(response.secret);
			} catch (error) {
				toast.error(error.message || "Lỗi khi tạo mã 2FA");
			} finally {
				setLoading(false);
			}
		};

		generate2FA();
	}, []);

	const onSubmit = async (data) => {
		try {
			setLoading(true);
			await authService.verify2FA(data.token);
			toast.success("Xác thực 2FA thành công");
			onSuccess && onSuccess();
		} catch (error) {
			toast.error(error.message || "Lỗi khi xác thực 2FA");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
			<Typography variant="h5" gutterBottom>
				Xác thực hai yếu tố (2FA)
			</Typography>

			<Typography variant="body2" color="text.secondary" paragraph>
				Vui lòng quét mã QR bằng ứng dụng Google Authenticator hoặc nhập mã thủ
				công:
			</Typography>

			{loading ? (
				<Box display="flex" justifyContent="center" my={3}>
					<CircularProgress />
				</Box>
			) : (
				<>
					{qrCode && (
						<Box display="flex" justifyContent="center" my={3}>
							<QRCodeSVG value={qrCode} size={200} />
						</Box>
					)}

					{secret && (
						<Alert severity="info" sx={{ mb: 2 }}>
							Mã thủ công: {secret}
						</Alert>
					)}

					<form onSubmit={handleSubmit(onSubmit)}>
						<TextField
							fullWidth
							label="Mã xác thực"
							{...register("token")}
							error={!!errors.token}
							helperText={errors.token?.message}
							margin="normal"
							disabled={loading}
						/>

						<Box display="flex" gap={2} mt={3}>
							<Button
								fullWidth
								variant="contained"
								type="submit"
								disabled={loading}>
								{loading ? <CircularProgress size={24} /> : "Xác nhận"}
							</Button>
							<Button
								fullWidth
								variant="outlined"
								onClick={onCancel}
								disabled={loading}>
								Hủy
							</Button>
						</Box>
					</form>
				</>
			)}
		</Paper>
	);
};

export default TwoFactorAuth;
