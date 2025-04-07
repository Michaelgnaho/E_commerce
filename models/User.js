import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: false, default: "Unnamed User" },
    email: { type: String, required: true, unique: true },
    imgUrl: { type: String, required: false, default: "" },
    cartItems: { type: Object, default: {} },
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
