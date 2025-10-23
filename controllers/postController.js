import { Router } from "express";

import Post from "../models/Post.js";
import { getErrorMessage } from "../utils/errorUtils.js";

const postController = Router();

// Get posts
postController.get('/', async (req, res) => {
    const posts = await Post.find().populate('author');

    res.json(posts);
});

// Create post
postController.post('/', async (req, res) => {
    const postData = req.body;
    const userId = req.user.id;

    try {
        const createdPost = await Post.create({
            ...postData,
            author: userId,
        });

        res.status(201).json(createdPost);
    } catch (err) {
        res.status(400).json({ message: getErrorMessage(err) })
    }
});

// Get post details
postController.get('/:postId', async (req, res) => {
    const postId = req.params.postId;

    const post = await Post.findById(postId).populate('author');

    if (!post) {
        return res.status(404).end();
    }

    res.json(post);
});

// Edit post
postController.put('/:postId', async (req, res) => {
    const postId = req.params.postId;
    const postData = req.body;

    try {
        const updatedPost = await Post.findByIdAndUpdate(postId, postData, { runValidators: true });

        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: getErrorMessage(err) });
    }
});

// Delete post
postController.delete('/:postId', async (req, res) => {
    const postId = req.params.postId;

    await Post.findByIdAndDelete(postId);

    res.status(204).end();
});

export default postController;
