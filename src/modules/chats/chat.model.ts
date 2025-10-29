import mongoose, { Document, model } from "mongoose";
import { IChat } from "./chat.interface";


    const ChatSchema  = new mongoose.Schema({
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        user2: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
          start_date: {
            type: Date,
            default: Date.now
        },
          recent_date: {
            type: Date,
            default: Date.now
        },
        messages: [{
            from: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            },
             to: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            },
             read: {
            type: Boolean,
            default: false,
            },
             date: {
            type: Date,
            default: Date.now
        },
         show_on_from: {
            type: Boolean,
            default: false,
            },
             show_on_to: {
            type: Boolean,
            default: false,
            },
              text: {
            type: String,
            default: true,
            },
        }]
      
    });
    export default mongoose.model<IChat & Document>('chat', ChatSchema);