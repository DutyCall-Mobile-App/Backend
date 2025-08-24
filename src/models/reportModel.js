import mongoose from "mongoose";

const reports = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: false },
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    evidence: [
      {
        fileUrl: {
          type: String,
          required: false,
        },
        fileType: {
          type: String,
          default: "image",
        },
      },
    ],
    full_name: {
      type: String,
      required: false,
    },
    nic: {
      type: String,
      required: false,
    },
    contact_number: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reports);

export default Report;
