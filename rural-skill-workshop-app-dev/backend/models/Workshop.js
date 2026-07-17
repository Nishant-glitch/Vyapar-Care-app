const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skillType: { 
    type: String, 
    enum: ['tailoring', 'carpentry', 'digital literacy', 'farming', 'other'],
    required: true 
  },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  maxParticipants: { type: Number, default: 30 },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Workshop', workshopSchema);