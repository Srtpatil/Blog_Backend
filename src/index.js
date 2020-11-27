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
const authRouter = require("./routes/authRouter");
const passport = require("passport");
require("./middlewares/Auth");

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
app.use(passport.initialize());

//Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

//routes for user
app.use("/user", userRouter);

//routes for user
app.use("/post", postRouter);

//routes for user
app.use("/bookmark", bookmarkRouter);

//routes for auth
app.use("/auth", authRouter);

//start the server
const port = process.env.PORT || 8081;
sequelize
  .sync({
    // force: true,
  })
  .then(() => {
    console.log("Connected to Database Successfully.");
    app.listen(port, () => {
      console.log("Application Server is up on port ", port);
    });
  })
  .catch((err) => console.log("Unable to Connect ", err));
