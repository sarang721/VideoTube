import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = mongoose.Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type:String,
        required:true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String,
        required: true,
    },
    coverImage:{
        type:String,
        required: false
    },
    watchHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password:{
        type: String,
        required: true
    },
    refreshToken:{
        type: String,
    }
},
{
    timeStamps: true
})


userSchema.pre('save',async function (next) {

    if(!this.isModified("password"))
    return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model('User',userSchema);