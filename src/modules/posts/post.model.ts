import mongoose, { Document, model } from "mongoose";
import { IPost } from "./post.interface";

    const PostSchema  = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
        
        content: {type: String,required: true},
       
        avatar : { type : String},
        
        name : {  type : String},
        
        title : {type : String},
       
        image : {type : String},
        
        like : [{
            
      user: {
                type: mongoose.Schema.Types.ObjectId
            }
        }],
        comments: [{
             user: {
                type: mongoose.Schema.Types.ObjectId
            },
            content: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    });
    export default mongoose.model<IPost & Document>('post', PostSchema);