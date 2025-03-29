class UserDTO {
	constructor(user) {
		this.id = user._id;
		this.fullName = user.fullName;
		this.email = user.email;
		this.phone = user.phone;
		this.isVerified = user.isVerified;
		this.roles = user.roles;
	}
}

module.exports = UserDTO;
