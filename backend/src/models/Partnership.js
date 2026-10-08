const mongoose = require('mongoose');

const partnershipSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Industry user reference is required']
    },
    industryProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Industry'
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedRole: {
      type: String,
      enum: ['STUDENT', 'INDUSTRY', 'UNIVERSITY', 'ADMIN'],
      default: 'STUDENT'
    },
    supportType: {
      type: String,
      enum: [
        'MENTORSHIP',
        'FUNDING',
        'TECHNOLOGY',
        'PROTOTYPING',
        'DEPLOYMENT',
        'TESTING',
        'PILOT',
        'IMPLEMENTATION',
        'TECH_TRANSFER',
        'EXPRESS_INTEREST',
        'PILOT_SUPPORT'
      ],
      required: [true, 'Support type is required']
    },
    proposedContribution: {
      type: String,
      trim: true,
      default: ''
    },
    resourcesEstimated: {
      type: String,
      trim: true,
      default: ''
    },
    timeline: {
      type: String,
      trim: true,
      default: '6 Months'
    },
    reason: {
      type: String,
      trim: true,
      default: ''
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true
    },
    resourcesOffered: [
      {
        type: String,
        trim: true
      }
    ],
    expectedInvolvement: {
      type: String,
      default: 'Co-development, technical supervision, and field pilot trials.',
      trim: true
    },
    fundingAmount: {
      type: Number,
      default: 0
    },
    assignedMentor: {
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      designation: { type: String, trim: true },
      phone: { type: String, trim: true }
    },
    status: {
      type: String,
      enum: [
        'PROPOSED',
        'UNDER_REVIEW',
        'ACCEPTED',
        'IN_PROGRESS',
        'COMPLETED',
        'REJECTED',
        'PENDING',
        'SUBMITTED',
        'ACTIVE'
      ],
      default: 'PROPOSED'
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date
    },
    updates: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String, default: 'Industry Partner' },
        userRole: { type: String, default: 'INDUSTRY' },
        title: { type: String, default: 'Progress Note' },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    documents: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        fileType: { type: String, default: 'application/pdf' },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploaderName: { type: String, default: 'Industry Partner' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Fallback to ensure description is never empty if reason or message provided
partnershipSchema.pre('validate', function (next) {
  if (!this.description) {
    this.description = this.proposedContribution || this.message || this.reason || `${this.supportType} collaboration request`;
  }
  next();
});

module.exports = mongoose.model('Partnership', partnershipSchema);
