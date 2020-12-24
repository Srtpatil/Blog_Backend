const express = require("express");
const passport = require("passport");
const { Op } = require("sequelize");
const router = express.Router();
const Bookmark = require("../models/Bookmark.model");
const Post = require("../models/Post.model");
const User = require("../models/user.model");

//create bookmark
router.post(
  "/add",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

//get users all bookmarks
router.get(
  "/:userId",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user_id = req.params.userId;

    try {
      let bookmarkedPosts = await Bookmark.findAll({
        where: {
          user_id: user_id,
        },
        include: [{ model: Post }],
      });

      let bookmarkedPostsWithAuthor = [];

      for (let i = 0; i < bookmarkedPosts.length; i++) {
        let userinfo = await User.findByPk(bookmarkedPosts[i].post.user_id);

        if (userinfo) {
          const obj = {
            data: bookmarkedPosts[i],
            Authorname: userinfo.name,
          };
          bookmarkedPostsWithAuthor.push(obj);
        }
      }

      return res.send(bookmarkedPostsWithAuthor);
    } catch (err) {
      res.status(400).send(err);
    }
  }
);

// Check if its is in database or not
router.get("/isBookmark/:postId&:userId", async (req, res) => {
  const post_id = req.params.postId;
  const user_id = req.params.userId;

  try {
    const bookmark = await Bookmark.findOne({
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

    if (bookmark) {
      res.status(200).send({
        is_bookmarked: true,
      });
    } else {
      res.status(200).send({
        is_bookmarked: false,
      });
    }
  } catch (err) {
    res.status(400).send({
      error: error.message,
    });
  }
});

// delete bookmark
router.delete(
  "/delete/:postId&:userId",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

module.exports = router;
