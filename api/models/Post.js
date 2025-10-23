import { Schema, Types, model } from "mongoose";

const postSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [10, 'Title too short!'],
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        minLength: [20, 'Content too short!'],
    },
    author: {
        type: Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

const Post = model('Post', postSchema);

export default Post;
