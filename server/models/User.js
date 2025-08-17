import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Remove any non-digits
        const cleaned = v.replace(/\D/g, '');
        // Accept 10 digits (without country code) or 12 digits (with +91)
        return /^[6-9][0-9]{9}$/.test(cleaned) || /^91[6-9][0-9]{9}$/.test(cleaned);
      },
      message: 'Please enter a valid Indian mobile number (10 digits starting with 6-9)'
    },
    set: function(v) {
      // Clean and normalize the mobile number
      const cleaned = v.replace(/\D/g, '');
      // If it starts with 91, remove country code
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        return cleaned.substring(2);
      }
      // If it starts with 0, remove it
      if (cleaned.startsWith('0') && cleaned.length === 11) {
        return cleaned.substring(1);
      }
      return cleaned;
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family'
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
