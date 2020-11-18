const express = require("express");
const sequelize = require("./db/Sequelize");
const User = require("./models/user.model");
const Post = require("./models/Post.model");
const Bookmark = require("./models/Bookmark.model");

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

const app = express();

//Store Data
// Post.create({
//   title: "Something Funny",
//   content: { address1: "123 test street", city: "Los Angeles", state: "CA" },
//   summary: "first post summary",
//   likes: 144,
//   is_published: true,
//   user_id: "59583330-297f-11eb-a383-3d9f979e6bf0",
// }).catch((err) => {
//   console.log("err ", err);
// });

// User.create({
//   name: "samarth",
//   email: "ex@gmail.com",
//   username: "Aries",
//   password: "test",
//   description: "Something",
// });

// Bookmark.create({
//   user_id: "44f6a6a0-2980-11eb-940a-41d45f24bf11",
//   post_id: "2192f050-2981-11eb-a89d-5f178c75a520",
// });

app.get("/", async (req, res) => {
  //find all posts associated with user
  // const users = await User.findAll({
  //   where: { user_id: "ca489c70-2979-11eb-a131-973bc6a33ea4" },
  //   include: [{ model: Post }],
  // });

  //find a post from its id
  // const users = await Post.findAll({
  //   include: User,
  // });

  //find bookmarks of a user
  // const users = await User.findAll({
  //   where: { user_id: "44f6a6a0-2980-11eb-940a-41d45f24bf11" },
  //   include: [{ model: Bookmark }],
  // });

  // //loop through array
  // const PostId = users[0].bookmarks[0].post_id;

  // //find post with that id
  // const post = await Post.findOne({
  //   where: { post_id: PostId },
  // });

  const post = await Bookmark.findAll({
    where: { user_id: "44f6a6a0-2980-11eb-940a-41d45f24bf11" },
    include: [{ model: Post }, { model: User }],
  });

  // const data = JSON.stringify(users);
  console.log("data ", post);
  res.send(post);
});

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
