
import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    autoReplySent: {
      type: Boolean,
      default: false,
    },
    
read: {
  type: Boolean,
  default: false,
},

replies: [
  {
    subject: {
      type: String,
      required: true,
      maxlength: 180,
    },
    message: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
],

  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.model(
  "ContactMessage",
  contactMessageSchema
);

export default ContactMessage;
