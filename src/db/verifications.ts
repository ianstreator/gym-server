import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  verificationCode: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

const verificationModel = mongoose.model("Verification", verificationSchema);

export const createVerification = (values: Record<string, any>) =>
  new verificationModel(values).save()

export const getVerificationByEmail = (email: string) =>
  verificationModel.findOne({ email });

export const deleteVerificationsByEmail = (email: string) =>
  verificationModel.deleteMany({ email });
