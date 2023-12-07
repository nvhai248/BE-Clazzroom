function generateRandomClassCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let classCode = "";
  for (let i = 0; i < length; i++) {
    classCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return classCode;
}

module.exports = { generateRandomClassCode };
