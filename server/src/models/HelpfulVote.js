import mongoose from 'mongoose';

const helpfulVoteSchema = new mongoose.Schema(
  {
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

helpfulVoteSchema.index({ review: 1, user: 1 }, { unique: true });

export const HelpfulVote = mongoose.model('HelpfulVote', helpfulVoteSchema);
