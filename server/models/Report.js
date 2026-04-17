import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  repoFullName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  repoId: {
    type: String,
  },
  report: {
    type: String,
    required: true,
  },
  repoDescription: {
    type: String,
  },
  lastAnalyzedCommitHash: {
    type: String,
  },
  lastRepoUpdate: {
    type: String,
  }
}, {
  timestamps: true 
});

export const Report = mongoose.model('Report', reportSchema);
