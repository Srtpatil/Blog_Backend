const express = require("express");
const Post = require("../models/Post.model");
const fetch = require("node-fetch");
const User = require("../models/user.model");
const sanitizeHtml = require("sanitize-html");
require("dotenv").config();
const router = express.Router();

//create summary from editor js content
function createSummary(content) {
  const blocks = content.blocks;
  let firstParagraphText;

  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type == "paragraph") {
      firstParagraphText = blocks[i].data.text;
      let cleanedText = sanitizeHtml(firstParagraphText, {
        allowedTags: [],
        allowedAttributes: {},
      });
      return cleanedText;
    }
  }

  const summary = "Enjoy The Read !";
  return summary;
}

//create a post or draft
router.post("/add", async (req, res) => {
  // console.log("HEVBJ ----- ");
  let { title, content, is_published, user_id, is_drafted } = req.body;
  const summary = createSummary(content);
  let post;
  try {
    title = title.replace("<br>", "");
    title = title.replace("<div>", "");
    title = title.replace("</div>", "");

    post = await Post.create({
      title,
      content,
      summary,
      is_published,
      is_drafted,
      user_id,
    }).catch((err) => {
      return res.status(400).send({
        error: err.message,
      });
    });

    return res.status(200).send({
      post,
      msg: "Post added Successfully",
    });
  } catch (err) {
    res.status(404).send({
      error: err.message,
    });
  }
});

//update a post or draft
router.patch("/edit/:postId", async (req, res) => {
  const post_id = req.params.postId;
  let { title, content, is_published, is_drafted } = req.body;
  title = title.replace("<br>", "");
  title = title.replace("<div>", "");
  title = title.replace("</div>", "");
  const summary = createSummary(content);
  try {
    const post = await Post.update(
      {
        title: title,
        content: content,
        summary: summary,
        is_published: is_published,
        is_drafted: is_drafted,
      },
      {
        where: {
          post_id: post_id,
        },
      }
    ).catch((err) => {
      console.log(err);
    });

    return res.status(200).send({
      msg: "Post Updated Successfully",
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

//get the latest posts
router.get("/latest_posts/:page", async (req, res) => {
  const page = req.params.page;
  try {
    const posts = await Post.findAndCountAll({
      where: { is_published: true },
      include: [{ model: User }],
      offset: (page - 1) * 10,
      limit: 10,
      order: [["updatedAt", "DESC"]],
    });

    if (!posts) {
      return res.status(404).send({
        msg: "Posts not Found",
      });
    }

    return res.send({ posts: posts.rows, totalPosts: posts.count });
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
      include: [{ model: User }],
    });

    return res.status(200).send({
      post: post,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

//get a users all posts
router.get("/allPosts/:userId&:page", async (req, res) => {
  const user_id = req.params.userId;
  const page = req.params.page;

  try {
    const user = await User.findOne({
      where: {
        user_id: user_id,
      },
    });

    if (!user) {
      return res.status(404).send({
        msg: "User not Found",
      });
    }

    const posts = await Post.findAndCountAll({
      where: {
        user_id: user_id,
        is_published: true,
      },
      offset: (page - 1) * 10,
      limit: 10,
      order: [["updatedAt", "DESC"]],
    });

    if (!posts) {
      return res.status(404).send({
        msg: "Posts not Found",
      });
    }
    return res.send({ posts: posts, user: user });
  } catch (err) {
    res.status(400).send(err);
  }
});

//get all drafts of a user

//delete a post
router.delete("/:postId", async (req, res) => {
  // console.log("Here!");
  const post_id = req.params.postId;
  // console.log("BODY: ", req.body);
  let { blocks } = req.body;
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === "image") {
      //make a delete request to image service
      let path = blocks[i].data.file.url;
      fetch(`${process.env.IMG_API}image/delete?path=${path}`, {
        method: "DELETE",
      });
    }
  }

  try {
    const post = await Post.destroy({
      where: {
        post_id: post_id,
      },
    }).catch((err) => {
      return res.status(400).send({
        error: err.message,
      });
    });

    return res.status(200).send({
      msg: "Post Deleted Successfully",
    });
  } catch (err) {
    return res.status(400).send(err);
  }
});

//get user's all drafts
router.get("/draft/:userId&:page", async (req, res) => {
  const user_id = req.params.userId;
  const page = req.params.page;
  try {
    const posts = await Post.findAndCountAll({
      where: {
        user_id: user_id,
        is_drafted: true,
      },
      offset: (page - 1) * 10,
      limit: 10,
      order: [["updatedAt", "DESC"]],
      include: [{ model: User }],
    });

    if (!posts) {
      return res.status(404).send({
        msg: "Drafts not Found",
      });
    }

    return res.send(posts);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Like a post
router.post("/like/:postId", async (req, res) => {
  const post_id = req.params.postId;
  try {
    const post = await Post.increment("likes", {
      where: {
        post_id: post_id,
      },
    });

    console.log(post);

    return res.status(200).send({
      msg: "Post Liked",
      likes: post.likes,
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

module.exports = router;
