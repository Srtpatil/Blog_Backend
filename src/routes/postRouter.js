const express = require("express");
const Post = require("../models/Post.model");
const { sum } = require("../models/user.model");
const User = require("../models/user.model");
const router = express.Router();

//create a post or draft
router.post("/add", async (req, res) => {
  let { title, content, summary, is_published } = req.body;
  try {
    await Post.create({
      title,
      content,
      summary,
      is_published,
    });

    return res.status(200).send({
      msg: "Post added Successfully",
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

//update a post or draft
router.patch("/edit/:postId", async (req, res) => {
  const post_id = req.params.postId;
  const { title, content, summary } = req.body;

  try {
    const post = await Post.update(
      {
        title: title,
        content: content,
        summary: summary,
      },
      {
        where: {
          post_id: post_id,
        },
      }
    );
    return res.status(200).send({
      msg: "Post Updated Successfully",
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

//publish a draft
router.patch("/publish-draft/:postId", async (req, res) => {
  const post_id = req.params.postId;

  try {
    await Post.update(
      {
        is_published: true,
      },
      {
        post_id: post_id,
      }
    );

    return res.status(200).send({
      msg: "Draft Published Successfully",
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

//unpublish a draft
router.patch("/unpublish-draft/:postId", async (req, res) => {
  const post_id = req.params.postId;
  try {
    await Post.update(
      {
        is_published: false,
      },
      {
        post_id: post_id,
      }
    );

    return res.status(200).send({
      msg: "Draft Unpublished Successfully",
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

//get the latest posts
router.get("/latest_posts/:page", async (req, res) => {
  const page = req.params.page;
  try {
    const posts = await Post.findAll({
      where: { is_published: true },
      offset: (page - 1) * 10,
      limit: 10,
      order: ["updatedAt", "DESC"],
    });

    if (!posts) {
      return res.status(404).send({
        msg: "Posts not Found",
      });
    }

    return res.send(posts);
  } catch (err) {
    res.status(400).send(err);
  }
});

//get a single post
router.get("/:postId", async (req, res) => {
  const post_id = req.params.postId;
  try {
    const post = await Post.findOne({
      where: {
        post_id: post_id,
      },
    });

    return res.status(200).send({
      post: post,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

//get a users all posts
router.get("/allPosts/:userId", async (req, res) => {
  const user_id = req.params.userId;

  try {
    const posts = await Post.findAll({
      where: {
        user_id: user_id,
      },
    });

    if (!posts) {
      return res.status(404).send({
        msg: "Posts not Found",
      });
    }

    return res.send(posts);
  } catch (err) {
    res.status(400).send(err);
  }
});

//delete a post
router.delete("/:postId", async (req, res) => {});

module.exports = router;

