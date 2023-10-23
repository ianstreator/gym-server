import mongoose from "mongoose";

const Activity = new mongoose.Schema({
  name: { type: String, required: true },
  reps: { type: Number, required: true },
  sets: { type: Number, required: true },
  setsRest: { type: Number, required: true },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  fitnessMotive: {
    motive: { type: String },
  },
  schedule: {
    sunday: [Activity],
    monday: [Activity],
    tuesday: [Activity],
    wednesday: [Activity],
    thursday: [Activity],
    friday: [Activity],
    saturday: [Activity],
  },
  workouts: [{ date: { type: Date }, activies: [Activity] }],
  verified: { type: Boolean, required: true, default: false },
  verificationCode: { type: String, select: false },
  authentication: {
    salt: { type: String, required: true, select: false },
    password: { type: String, required: true, select: false },
    sessionToken: { type: String, required: false, select: false },
  },
});

export const userModel = mongoose.model("User", userSchema);

// create delete update
export const createUser = (values: Record<string, any>) =>
  new userModel(values).save().then((user) => user.toObject());

export const deleteUser = (id: string) =>
  userModel.findOneAndDelete({ _id: id });

export const updateUserByEmail = (email: string, values: Record<string, any>) =>
  userModel.findOneAndUpdate({ email }, values);

// find user(s) methods
export const getUsers = () => userModel.find();

export const getUserByEmail = (email: string) => userModel.findOne({ email });

export const getUserById = (id: string) => userModel.findById(id);

export const getUserBySessionToken = (sessionToken: string) =>
  userModel.findOne({
    "authentication.sessionToken": sessionToken,
  });
