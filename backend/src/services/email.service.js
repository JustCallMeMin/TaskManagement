const transporter = require("../config/mail");

class EmailService {
	static async sendPasswordResetEmail(email, fullName, resetToken) {
		await transporter.sendMail({
			to: email,
			subject: "Đặt lại mật khẩu",
			html: `
                <h2>Xin chào ${fullName},</h2>
                <p>Mã OTP để đặt lại mật khẩu của bạn là: <strong style="font-size: 20px; color: #4CAF50;">${resetToken}</strong></p>
                <p>Mã này sẽ hết hạn sau 5 phút.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,<br>Task Management Team</p>
            `,
		});
	}

	static async sendVerificationEmail(email, fullName, verificationToken) {
		const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

		await transporter.sendMail({
			to: email,
			subject: "Xác thực tài khoản",
			html: `
                <h2>Xin chào ${fullName},</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào link bên dưới để xác thực email:</p>
                <p><a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Xác thực email</a></p>
                <p>Hoặc copy link sau vào trình duyệt: ${verificationUrl}</p>
                <p>Link này sẽ hết hạn sau 24 giờ.</p>
                <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.</p>
                <p>Trân trọng,<br>Task Management Team</p>
            `,
		});
	}

	static async sendTwoFactorCode(email, fullName, code) {
		await transporter.sendMail({
			to: email,
			subject: "Mã xác thực hai lớp",
			html: `
                <h2>Xin chào ${fullName},</h2>
                <p>Mã xác thực của bạn là: <strong style="font-size: 20px; color: #4CAF50;">${code}</strong></p>
                <p>Mã này sẽ hết hạn sau 5 phút.</p>
                <p>Nếu bạn không thực hiện yêu cầu này, vui lòng đổi mật khẩu ngay lập tức.</p>
                <p>Trân trọng,<br>Task Management Team</p>
            `,
		});
	}
}

module.exports = EmailService;
