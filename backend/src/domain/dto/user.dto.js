class UserDTO {
	constructor(user) {
		this.id = user._id;
		this.fullName = user.fullName;
		this.email = user.email;
		this.phone = user.phone;
		this.isVerified = user.isVerified;
		
		// Ensure roles is properly formatted
		if (user.roles) {
			this.roles = Array.isArray(user.roles) 
				? user.roles 
				: [];
		} else {
			this.roles = [];
		}
	}
}

module.exports = UserDTO;
