import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user'
  },
  loginCount: {
        type: Number,
        default: 0
    },
},{timestamps: true});

const User = mongoose.model('User', userSchema);
export default User