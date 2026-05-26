import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { IUser } from "../../common/interfaces";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums";
import { generateEncryption, generateHash } from "../../common/utils/security";
const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    slug: {
      type: String,
      required: true,
    },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function (this) {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    phone: { type: String },
    profilePicture: { type: String },
    profileCoverPictures: { type: [String] },
    // //friends: [{ type: Types.ObjectId, ref: "users" }],
    friends: [{ type: Types.ObjectId, ref: "User" }],
    gender: {
      type: Number,
      enum: GenderEnum,
      default: GenderEnum.MALE,
    },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.USER },
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.SYSTEM,
    },
    changeCredentialsTime: { type: Date },
    DOB: { type: Date },
    confirmEmail: { type: Date },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    strict: true,
    strictQuery: true,
  },
);
userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.firstName = firstName as string;
    this.lastName = lastName as string;
    this.slug = value.replaceAll(/\s+/g, "-");
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });
// ====================
userSchema.pre(["updateOne", "findOneAndUpdate"], function () {
  const update = this.getUpdate() as HydratedDocument<IUser>;
  if (update.deletedAt) {
    this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
  }
  if (update.restoredAt) {
    this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
    this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
  }
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ deletedAt: { $exists: false }, ...query });
  }
});
userSchema.pre(["findOne", "find", "countDocuments"], function () {
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});
userSchema.pre(["deleteOne", "findOneAndDelete"], function () {
  const query = this.getQuery();
  if (query.force === true) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ deletedAt: { $exists: true }, ...query });
  }
});
userSchema.pre(
  "save",
  async function (this: HydratedDocument<IUser> & { wasNew: boolean }) {
    this.wasNew = this.isNew;

    if (this.isModified("password")) {
      this.password = await generateHash({ plaintext: this.password });
    }

    if (this.phone && this.isModified("phone")) {
      this.phone = await generateEncryption(this.phone);
    }
  },
);
export const UserModel = models.User || model<IUser>("User", userSchema);
UserModel.syncIndexes();