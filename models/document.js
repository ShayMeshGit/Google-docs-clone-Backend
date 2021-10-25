const mongoose = require("mongoose");
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  _id: String,
  content: Object,
});

module.exports = mongoose.model("Document", DocumentSchema);
