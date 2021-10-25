require("dotenv").config();
const http = require("http");
const initWS = require("socket.io");
const Doc = require("./models/document");
const mongoose = require("mongoose");

const server = http.createServer();
const io = initWS(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

mongoose.connect(
  `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/google-docs-clone?authSource=admin`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

io.on("connection", (socket) => {
  socket.on("get-document", async (docId) => {
    const content = await findOrCreateDocContent(docId);
    socket.join(docId);
    socket.emit("load-content", content);

    socket.on("save-content", async (content) => {
      await Doc.findByIdAndUpdate(docId, { content });
      console.log("Saved doc");
    });

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(docId).emit("recevice-changes", delta);
    });
  });
});

const findOrCreateDocContent = async (id) => {
  const document = await Doc.findById(id);
  if (document) return document.content;
  const newDoc = new Doc({
    _id: id,
    content: "",
  });
  const doc = await newDoc.save();
  return doc.content;
};

server.listen(process.env.SERVER_PORT, () => {
  console.log(`listening on port ${process.env.SERVER_PORT}...`);
});
