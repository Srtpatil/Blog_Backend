const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const Bookmark = require("../models/Bookmark.model");
const Post = require("../models/Post.model");

//create bookmark
router.post("/add", async (req, res) => {
  const { user_id, post_id } = req.body;

  try {
    await Bookmark.create({
      user_id,
      post_id,
    });

    return res.status(201).send({
      msg: "Post Bookmarked",
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

//get users all bookmarks
router.get("/:userId", async (req, res) => {
  const user_id = req.params.userId;

  try {
    const bookmarkedPosts = Bookmark.findAll({
      where: {
        user_id: user_id,
      },
      include: [{ model: Post }],
    });
    //changes while testing
    return res.send(bookmarkedPosts);
  } catch (err) {
    res.status(400).send(err);
  }
});

// delete bookmark
router.delete("/:postId&:userId", async (req, res) => {
  const post_id = req.params.postId;
  const user_id = req.params.userId;

  try {
    await Bookmark.destroy({
      where: {
        [Op.and]: [
          {
            post_id: post_id,
          },
          {
            user_id: user_id,
          },
        ],
      },
    });

    return res.status(200).send({
      msg: "Bookmark Removed Successfully.",
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
