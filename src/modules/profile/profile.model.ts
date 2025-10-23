
import mongoose, { Schema } from "mongoose";
import { IProfile } from "./profile.interface";
import { Document } from "mongoose";

// Education Sub-Schema
const EducationSchema = new Schema({
    school: {
        type: String,
        required: true,
        trim: true
    },
    degree: {
        type: String,
        required: true,
        trim: true
    },
    fieldofstudy: {
        type: String,
        required: true,
        trim: true
    },
    from: {
        type: Date,
        required: true
    },
    to: {
        type: Date
    },
    current: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true
    }
}, { _id: true });

// Social Sub-Schema
const SocialSchema = new Schema({
    facebook: {
        type: String,
        trim: true
    },
    youtube: {
        type: String,
        trim: true
    },
    tiktok: {
        type: String,
        trim: true
    },
    instagram: {
        type: String,
        trim: true
    }
});

// Main Profile Schema
const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    location: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        required: true
    },
    education: [EducationSchema],
    social: SocialSchema,
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Profile = mongoose.model<IProfile & Document>("Profile", ProfileSchema);
export default Profile;