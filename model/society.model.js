class Society {
  constructor(id, societyName, email, address, secretary, resources, wings) {
    this.societyId = id;
    this.societyName = societyName;
    this.email = email;
    this.address = address;
    this.secretary = secretary;
    this.resource = resources; // array of common resources
    this.wing = wings; // array of wing and its resources
    this.createdAt = new Date();
  }
}

module.exports = Society;

