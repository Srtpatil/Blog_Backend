const express = require("express");
const sequelize = require("./db/Sequelize");
const bodyParser = require("body-parser");
const User = require("./models/user.model");
const Post = require("./models/Post.model");
const Bookmark = require("./models/Bookmark.model");
const cors = require("cors");
// const AuthToken = require("./models/Authtoken.model");
const userRouter = require("./routes/userRouter");
const postRouter = require("./routes/postRouter");
const bookmarkRouter = require("./routes/bookmarkRouter");

//define Associations
//one to many --> user and post
User.hasMany(Post, { foreignKey: "user_id" });
Post.belongsTo(User, { foreignKey: "user_id" });

//one to many --> user has many bookmarks
User.hasMany(Bookmark, { foreignKey: "user_id" });
Bookmark.belongsTo(User, { foreignKey: "user_id" });

//A post can be bookmarked by multiple users
Post.hasMany(Bookmark, { foreignKey: "post_id" });
Bookmark.belongsTo(Post, { foreignKey: "post_id" });

//A user can have many tokens
// User.hasMany(AuthToken, { foreignKey: "user_id" });
// AuthToken.belongsTo(User, { foreignKey: "user_id" });

const app = express();

app.use(cors());

//Store Data
// Post.create({
//   title: "Something Funny",
//   content: { address1: "123 test street", city: "Los Angeles", state: "CA" },
//   summary: "first post summary",
//   likes: 144,
//   is_published: true,
//   user_id: "e593e110-2992-11eb-906d-d1b8941196a5",
// }).catch((err) => {
//   console.log("err ", err);
// });

// User.create({
//   name: "Yo",
//   email: "yo@gmail.com",
//   username: "oyo",
//   password: "string",
//   description: "yo !",
// });

// Bookmark.create({
//   user_id: "e593e110-2992-11eb-906d-d1b8941196a5",
//   post_id: "062d3750-2993-11eb-9e35-99dcb277a35f",
// });

// let pass2 = "$2b$10$/fWG8dYHccgNAFe/w435huNDyiHQmjIRu0TKIeFb1YV84cXE2Bj0y";
// bcrypt.compare("string", pass2).then((res) => {
//   console.log("---------- ---", res);
// });

//Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

//routes for user
app.use("/user", userRouter);

//routes for user
app.use("/post", postRouter);

//routes for user
app.use("/bookmark", bookmarkRouter);

//start the server
const port = process.env.PORT || 8081;
sequelize
  .sync()
  .then(() => {
    console.log("Connected to Database Successfully.");
    app.listen(port, () => {
      console.log("Application Server is up on port ", port);
    });
  })
  .catch((err) => console.log("Unable to Connect ", err));
