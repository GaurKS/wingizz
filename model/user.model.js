class User {
  constructor(name, userId, email, password, contact, role, address) {
    this.name = name;
    this.userTag = userId;
    this.email = email;
    this.password = password;
    this.contact = contact;
    this.role = role;
    this.address = address; // {societyId, wingId, flatNo}
    this.active = true;
    this.isPasswordReset = false;
    this.createdAt = new Date();
  }
}

module.exports = User