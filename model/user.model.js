class User {
  constructor(username, id, email, password, contact, roles, address) {
    this.username = username;
    this.userTag = id;
    this.email = email;
    this.password = password;
    this.contact = contact;
    this.roles = roles;
    this.address = address; // {societyId, wingId, flatNo}
    this.active = true;
    this.isPasswordReset = false;
    this.createdAt = new Date();
  }
}

module.exports = User