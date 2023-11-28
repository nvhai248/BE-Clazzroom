const bcrypt = require("bcrypt");

class hasher {
  generateSalt() {
    const saltRounds = 10;
    return bcrypt.genSaltSync(saltRounds);
  }

  encode(data) {
    var hasPW = bcrypt.hashSync(data, this.generateSalt());
    return hasPW;
  }

  compare(hashPW, data) {
    return bcrypt.compareSync(data, hashPW);
  }
}

module.exports = new hasher();
