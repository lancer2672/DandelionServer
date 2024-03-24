const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PermissionSchema = new Schema(
  {
    read: {
      type: [String],
      default: [],
    },
    write: {
      type: [String],
      default: [],
    },
    delete: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    permissions: {
      type: Schema.Types.ObjectId,
      ref: "permission",
    },
    child: {
      type: Schema.Types.ObjectId,
      ref: "role",
    },
  },
  { timestamps: true }
);

module.exports = {
  Role: mongoose.model("role", RoleSchema),
  Permission: mongoose.model("permission", PermissionSchema),
};
