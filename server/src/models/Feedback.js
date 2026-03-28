const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    default: "One-click feedback" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;