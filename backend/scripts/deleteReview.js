import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { TeacherReview } from '../src/models/teacherReview.model.js';
import { SubjectReview } from '../src/models/subjectReview.js';

dotenv.config();

const DB = process.env.MONGO_URI;

mongoose.connect(DB) // no need for extra options in Mongoose 7+
  .then(async () => {
    console.log('MongoDB connected');

    const teacherRes = await TeacherReview.deleteMany({});
    console.log(`Deleted ${teacherRes.deletedCount} teacher reviews`);

    const subjectRes = await SubjectReview.deleteMany({});
    console.log(`Deleted ${subjectRes.deletedCount} subject reviews`);

    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
