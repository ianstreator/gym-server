import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  verified: { type: Boolean, required: true },
  authentication: {
    salt: { type: String, select: false },
    password: { type: String, required: true, select: false },
    sessionToken: { type: String, select: false, required: false },
  },
});

export const userModel = mongoose.model("User", userSchema);

export const getUsers = () => userModel.find();

export const getUserByEmail = (email: string) => userModel.findOne({ email });

export const getUserBySesstionToken = (sessionToken: string) =>
  userModel.findOne({
    "authentication.sessionToken": sessionToken,
  });

export const getUserById = (id: string) => userModel.findById(id);

export const createUser = (values: Record<string, any>) =>
  new userModel(values).save().then((user) => user.toObject());
export const deleteUser = (id: string) =>
  userModel.findOneAndDelete({ _id: id });

export const updateUserById = (id: string, values: Record<string, any>) =>
  userModel.findByIdAndUpdate(id, values);

export const verifyUserByEmail = (email: string) =>
  userModel
    .findOneAndUpdate({ email, verified: true })
    .then((user) => console.log(user));
