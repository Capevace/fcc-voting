const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pollSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    body: String
  }],
  votes: [{
    option: Schema.Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    ip: String
  }],
  createdAt: Date
});

module.exports = mongoose.model('Poll', pollSchema);
