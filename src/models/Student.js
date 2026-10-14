const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gradeLevel: { type: Number, required: true, min: 1, max: 12 },
    guardianEmail: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

studentSchema.virtual("fullName").get(function getFullName() {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Student", studentSchema);
