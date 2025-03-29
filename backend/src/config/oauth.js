const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const UserRepository = require("../domain/repositories/user.repository");
const AuthService = require("../domain/services/auth.service");
const logger = require("../utils/logger");

// Log thông tin cấu hình OAuth
logger.info("OAuth Configuration initialized", {
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Configured" : "Missing",
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Configured" : "Missing",
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? "Configured" : "Missing",
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? "Configured" : "Missing",
	API_URL: process.env.API_URL,
	PORT: process.env.PORT,
	GOOGLE_CALLBACK_URL: `${process.env.API_URL || 'http://localhost:5001'}/api/auth/google/callback`,
	GITHUB_CALLBACK_URL: `${process.env.API_URL || 'http://localhost:5001'}/api/auth/github/callback`
});

// Cấu hình Google OAuth
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: `${process.env.API_URL || 'http://localhost:5001'}/api/auth/google/callback`,
			proxy: true,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				logger.debug("Google OAuth profile received", {
					id: profile.id,
					displayName: profile.displayName,
					emails: profile.emails ? profile.emails.map(e => e.value) : [],
					photos: profile.photos ? profile.photos.map(p => p.value) : []
				});

				// Kiểm tra xem user đã tồn tại chưa
				let user = await UserRepository.findByEmail(profile.emails[0].value);
				logger.debug("User lookup by email", { 
					email: profile.emails[0].value,
					found: !!user 
				});

				if (!user) {
					// Tạo user mới nếu chưa tồn tại
					logger.info("Creating new user with Google OAuth", { 
						email: profile.emails[0].value 
					});
					user = await AuthService.registerWithOAuth({
						email: profile.emails[0].value,
						fullName: profile.displayName,
						avatar: profile.photos[0].value,
						provider: "google",
						providerId: profile.id,
					});
					logger.success("New user created with Google OAuth", { 
						userId: user._id,
						email: user.email 
					});
				} else {
					// Cập nhật thông tin OAuth nếu user đã tồn tại
					logger.info("Updating existing user with Google OAuth", { 
						userId: user._id,
						email: user.email 
					});
					user = await AuthService.updateOAuthProvider(user, {
						provider: "google",
						providerId: profile.id,
						avatar: profile.photos[0].value
					});
					logger.success("User updated with Google OAuth", { 
						userId: user._id 
					});
				}

				return done(null, user);
			} catch (error) {
				logger.error("Google OAuth error", error);
				return done(error, null);
			}
		}
	)
);

// Cấu hình GitHub OAuth
passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: `${process.env.API_URL || 'http://localhost:5001'}/api/auth/github/callback`,
			scope: ['user:email'],
			proxy: true,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				logger.debug("GitHub OAuth profile received", {
					id: profile.id,
					displayName: profile.displayName,
					emails: profile.emails ? profile.emails.map(e => e.value) : [],
					photos: profile.photos ? profile.photos.map(p => p.value) : []
				});

				if (!profile.emails || profile.emails.length === 0) {
					logger.error("No email returned from GitHub", { profileId: profile.id });
					return done(new Error("GitHub không cung cấp email. Vui lòng đảm bảo email của bạn là public trên GitHub hoặc đăng nhập bằng phương thức khác."), null);
				}

				const userEmail = profile.emails[0].value;
				
				// Kiểm tra xem user đã tồn tại chưa
				let user = await UserRepository.findByEmail(userEmail);
				logger.debug("User lookup by email", { 
					email: userEmail,
					found: !!user 
				});

				if (!user) {
					// Tạo user mới nếu chưa tồn tại
					logger.info("Creating new user with GitHub OAuth", { 
						email: userEmail 
					});
					user = await AuthService.registerWithOAuth({
						email: userEmail,
						fullName: profile.displayName,
						avatar: profile.photos ? profile.photos[0].value : null,
						provider: "github",
						providerId: profile.id,
					});
					logger.success("New user created with GitHub OAuth", { 
						userId: user._id,
						email: user.email 
					});
				} else {
					// Cập nhật thông tin OAuth nếu user đã tồn tại
					logger.info("Updating existing user with GitHub OAuth", { 
						userId: user._id,
						email: user.email 
					});
					user = await AuthService.updateOAuthProvider(user, {
						provider: "github",
						providerId: profile.id,
						avatar: profile.photos ? profile.photos[0].value : user.avatar
					});
					logger.success("User updated with GitHub OAuth", { 
						userId: user._id 
					});
				}

				return done(null, user);
			} catch (error) {
				logger.error("GitHub OAuth error", error);
				return done(error, null);
			}
		}
	)
);

// Serialize user cho session
passport.serializeUser((user, done) => {
	logger.debug("Serializing user to session", { userId: user.id });
	done(null, user.id);
});

// Deserialize user từ session
passport.deserializeUser(async (id, done) => {
	try {
		logger.debug("Deserializing user from session", { userId: id });
		const user = await UserRepository.findById(id);
		done(null, user);
	} catch (error) {
		logger.error("Error deserializing user", error);
		done(error, null);
	}
});

module.exports = passport;
