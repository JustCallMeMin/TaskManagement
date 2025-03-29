import React from "react";
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
import AuthService from "../../services/auth.service";
import { ERROR_MESSAGES } from "../../utils/constants";

const schema = yup.object().shape({
	code: yup
		.string()
		.required("Vui lòng nhập mã bảo mật")
		.matches(/^\d{6}$/, "Mã bảo mật phải có 6 chữ số"),
});

const SecurityCode = ({ onSuccess, onCancel }) => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const onSubmit = async (data) => {
		try {
			await AuthService.verifySecurityCode(data.code);
			toast.success("Xác thực mã bảo mật thành công");
			onSuccess && onSuccess();
		} catch (error) {
			toast.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
		}
	};

	return (
		<Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
			<Typography variant="h5" gutterBottom>
				Xác thực mã bảo mật
			</Typography>

			<Alert severity="info" sx={{ mb: 3 }}>
				Chúng tôi đã gửi mã bảo mật đến email của bạn. Vui lòng kiểm tra và nhập
				mã để tiếp tục.
			</Alert>

			<form onSubmit={handleSubmit(onSubmit)}>
				<TextField
					fullWidth
					label="Mã bảo mật"
					{...register("code")}
					error={!!errors.code}
					helperText={errors.code?.message}
					margin="normal"
					disabled={isSubmitting}
				/>

				<Box display="flex" gap={2} mt={3}>
					<Button
						fullWidth
						variant="contained"
						type="submit"
						disabled={isSubmitting}>
						{isSubmitting ? <CircularProgress size={24} /> : "Xác nhận"}
					</Button>
					<Button
						fullWidth
						variant="outlined"
						onClick={onCancel}
						disabled={isSubmitting}>
						Hủy
					</Button>
				</Box>
			</form>
		</Paper>
	);
};

export default SecurityCode;
