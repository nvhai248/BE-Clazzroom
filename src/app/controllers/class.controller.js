class ClassController {
  test = (req, res) => {
    res.send("OK");
  };
}

module.exports = new ClassController();
