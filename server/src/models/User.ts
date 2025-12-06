// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

// 1. The TypeScript Interface (for code completion)
export interface IUser extends Document {
  clerkId: string;       // The ID from Clerk (Crucial for linking)
  githubUsername: string;
  bio: string;
  isVerified: boolean;   // The "Vibe Check" status
  skills: string[];      // List of verified skills
  createdAt: Date;
}

// 2. The Mongoose Schema (for Database validation)
const UserSchema: Schema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    githubUsername: { type: String, required: true },
    bio: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    skills: { type: [String], default: [] },
    badQualityCount:{ type:Number, default:0, required:true, },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// 3. Export the Model
// The "||" check prevents "OverwriteModelError" in hot-reload environments
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);