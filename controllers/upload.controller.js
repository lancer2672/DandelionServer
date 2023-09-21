exports.handleUpload = async (req, res) => {
  try {
    if (req.file) {
      res.json({ message: "Success", data: { fileUrl: req.file.path } });
    } else {
      res.status(400).json({ message: "No file uploaded" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
