const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['text', 'video', 'file'], default: 'text' },
  content: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // minutos
  order: { type: Number, default: 0 }
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  lessons: [lessonSchema]
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  maxScore: { type: Number, default: 100 }
});

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, required: true },
  content: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  score: { type: Number, default: null },
  feedback: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  graded: { type: Boolean, default: false }
});

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledAt: { type: Date, default: Date.now },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  progress: { type: Number, default: 0 } // porcentaje 0-100
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  thumbnail: { type: String, default: '/img/default-course.png' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, default: 'General' },
  level: { type: String, enum: ['Principiante', 'Intermedio', 'Avanzado'], default: 'Principiante' },
  language: { type: String, default: 'Español' },
  sections: [sectionSchema],
  assignments: [assignmentSchema],
  submissions: [submissionSchema],
  enrollments: [enrollmentSchema],
  published: { type: Boolean, default: false },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

courseSchema.virtual('totalLessons').get(function () {
  return this.sections.reduce((acc, section) => acc + section.lessons.length, 0);
});

courseSchema.virtual('enrollmentCount').get(function () {
  return this.enrollments.length;
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);