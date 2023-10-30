import mongoose from "mongoose";
import { Types } from "@constfitness/types";

const Activity = new mongoose.Schema<Types.Activity>({
  name: { type: String, required: true },
  repsAmount: { type: Number, required: true },
  setsAmount: { type: Number, required: true },
  restSeconds: { type: Number, required: true },
});

const Workout = new mongoose.Schema<Types.Workout>({
  date: { type: Date, required: true },
  _id: { type: String, required: true },
  completion: { type: Number, required: true },
  activies: { type: [Activity], required: true },
});

const userSchema = new mongoose.Schema<Types.User>({
  username: { type: String, required: true },
  email: { type: String, required: true },
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
    sessionToken: { type: String, select: false },
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
