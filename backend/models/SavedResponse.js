import mongoose from 'mongoose';

const savedResponseSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  modified: {
    type: Boolean,
    default: false
  },
  originalContent: String
});

const SavedResponse = mongoose.model('SavedResponse', savedResponseSchema);

export default SavedResponse;