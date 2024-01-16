import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        required: true
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

export const Comment = mongoose.model('Comment', commentSchema);