import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../../common/interfaces";
import {
  redisService,
  RedisService,
  s3Service,
  S3Service,
} from "../../common/services";
import { TokenService } from "../../common/services/token.service";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../../config/config";
import { ChatEnum, LogoutEnum, RoleEnum } from "../../common/enums";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../common/exceptions";
import { ChatRepository, UserRepository } from "../../DB/repository";
import { PostRepository } from "../../DB/repository";
import { compareHash } from "../../common/utils/security";
import { toObjectId } from "../../common/utils/object.Id";
export class UserService {
  private readonly redis: RedisService;
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;
  private readonly chatRepository: ChatRepository;
  private readonly postRepository: PostRepository;
  private readonly s3: S3Service;
  constructor() {
    this.redis = redisService;
    this.tokenService = new TokenService();
    this.userRepository = new UserRepository();
    this.chatRepository = new ChatRepository();
    this.postRepository = new PostRepository();
    this.s3 = s3Service;
  }
  async profile(user: HydratedDocument<IUser>): Promise<object> {
    const populatedUser = await this.userRepository.findOne({
      filter: { _id: user._id },
      options: {
        populate: [
          {
            path: "friends",
          },
        ],
      },
    });
    const posts = await this.postRepository.find({
      filter: { createdBy: user._id },
    });
    const totalLikes = posts.reduce(
      (acc, post) => acc + (post.likes?.length || 0),
      0,
    );
    const groups = await this.chatRepository.find({ filter: { type: ChatEnum.ovm, participants: { $in: [user._id] } } })
    return {
      user: (populatedUser || user).toJSON(),
      stats: {
        postsCount: posts.length,
        totalLikes,
        friendsCount: (user.friends as [])?.length || 0,
      },
      groups
    };
  }
  async getOtherProfile(
    userId: string,
    currentUser: HydratedDocument<IUser>,
  ): Promise<object> {
    const targetUser = await this.userRepository.findOne({
      filter: { _id: userId },
      projection:
        "firstName lastName profilePicture profileCoverPictures slug friends gender DOB",
    });
    if (!targetUser) throw new NotFoundException("User not found");
    const isFriend = (targetUser.friends as Types.ObjectId[])?.some(
      (f) => f.toString() === currentUser._id.toString(),
    );
    const posts = await this.postRepository.find({
      filter: {
        createdBy: toObjectId(userId),
        availability: isFriend ? { $in: [0, 1] } : { $in: [0] },
      },
    });
    const totalLikes = posts.reduce(
      (acc, post) => acc + (post.likes?.length || 0),
      0,
    );
    return {
      user: {
        _id: targetUser._id,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        profilePicture: targetUser.profilePicture,
        profileCoverPictures: targetUser.profileCoverPictures,
        slug: targetUser.slug,
        gender: targetUser.gender,
        isFriend,
      },
      stats: {
        postsCount: posts.length,
        totalLikes,
        friendsCount: (targetUser.friends as [])?.length || 0,
      },
    };
  }
  async updateProfile(
    data: Partial<IUser>,
    user: HydratedDocument<IUser>,
  ): Promise<IUser> {
    const { firstName, lastName, phone, gender, DOB } = data as any;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (DOB) user.DOB = DOB;
    await user.save();
    return user.toJSON();
  }
  async updatePassword(
    {
      oldPassword,
      password,
    }: { oldPassword: string; password: string; confirmPassword: string },
    user: HydratedDocument<IUser>,
  ): Promise<void> {
    const isMatch = await compareHash({
      plaintext: oldPassword,
      cipherText: user.password,
    });
    if (!isMatch) throw new BadRequestException("Old password is incorrect");
    user.password = password;
    user.changeCredentialsTime = new Date();
    await user.save();
    await this.redis.deleteKey(
      await this.redis.keys(this.redis.baseRevokeTokenKey(user._id)),
    );
  }
  async profileCoverImages(
    files: Express.Multer.File[],
    user: HydratedDocument<IUser>,
  ): Promise<IUser> {
    const oldUrls = user.profileCoverPictures;
    const urls = await this.s3.uploadAssets({
      files,
      path: `Users/${user._id.toString()}/Profile/Cover`,
    });
    user.profileCoverPictures = urls;
    await user.save();
    if (oldUrls?.length) {
      await this.s3.deleteAssets({
        Keys: oldUrls.map((ele) => ({ Key: ele })),
      });
    }
    return user.toJSON();
  }
  async profileImage(
    {
      ContentType,
      Originalname,
    }: { ContentType: string; Originalname: string },
    user: HydratedDocument<IUser>,
  ): Promise<{ user: IUser; url: string }> {
    const { url } = await this.s3.createPreSignedUploadLink({
      path: `Users/${user._id.toString()}/Profile`,
      ContentType,
      Originalname,
    });
    user.profilePicture = url as string;
    await user.save();
    return { user: user.toJSON(), url };
  }
  async addFriend(
    friendId: string,
    user: HydratedDocument<IUser>,
  ): Promise<object> {
    if (friendId === user._id.toString())
      throw new BadRequestException("Cannot add yourself as friend");
    const friend = await this.userRepository.findOne({
      filter: { _id: friendId },
    });
    if (!friend) throw new NotFoundException("User not found");
    const alreadyFriend = (user.friends as Types.ObjectId[])?.some(
      (f) => f.toString() === friendId,
    );
    if (alreadyFriend) throw new ConflictException("Already friends");
    await this.userRepository.findOneAndUpdate({
      filter: { _id: user._id },
      update: { $addToSet: { friends: toObjectId(friendId) } },
    });
    await this.userRepository.findOneAndUpdate({
      filter: { _id: friendId },
      update: { $addToSet: { friends: user._id } },
    });
    return { message: "Friend added successfully" };
  }
  async removeFriend(
    friendId: string,
    user: HydratedDocument<IUser>,
  ): Promise<object> {
    await this.userRepository.findOneAndUpdate({
      filter: { _id: user._id },
      update: { $pull: { friends: toObjectId(friendId) } },
    });
    await this.userRepository.findOneAndUpdate({
      filter: { _id: friendId },
      update: { $pull: { friends: user._id } },
    });
    return { message: "Friend removed successfully" };
  }
  async logout(
    { flag }: { flag: LogoutEnum },
    user: HydratedDocument<IUser>,
    { jti, iat, sub }: { jti: string; iat: number; sub: string },
  ): Promise<number> {
    let status = 200;
    switch (flag) {
      case LogoutEnum.ALL:
        user.changeCredentialsTime = new Date();
        await user.save();
        await this.redis.deleteKey(
          await this.redis.keys(this.redis.baseRevokeTokenKey(sub)),
        );
        break;
      default:
        await this.tokenService.createRevokeToken({
          userId: sub,
          jti,
          ttl: iat + REFRESH_TOKEN_EXPIRES_IN,
        });
        status = 201;
        break;
    }
    return status;
  }
  async rotateToken(
    user: HydratedDocument<IUser>,
    { sub, jti, iat }: { jti: string; iat: number; sub: string },
    issuer: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    if ((iat + ACCESS_TOKEN_EXPIRES_IN) * 1000 >= Date.now() + 30000) {
      throw new ConflictException("Current access token still valid");
    }
    const remainingTtl =
      iat + REFRESH_TOKEN_EXPIRES_IN - Math.floor(Date.now() / 1000);
    await this.tokenService.createRevokeToken({
      userId: sub,
      jti,
      ttl: remainingTtl > 0 ? remainingTtl : 1,
    });
    return await this.tokenService.createLoginCredentials(user, issuer);
  }
  async softDeleteAccount(user: HydratedDocument<IUser>): Promise<object> {
    await this.userRepository.findOneAndUpdate({
      filter: { _id: user._id },
      update: { deletedAt: new Date() },
    });
    return { message: "Account deactivated successfully" };
  }
  async deleteAccount(user: HydratedDocument<IUser>): Promise<object> {
    const account = await this.userRepository.deleteOne({
      filter: { _id: user._id, force: true },
    });
    if (!account.deletedCount) throw new NotFoundException("Invalid account");
    await this.s3.deleteFolderByPrefix({
      prefix: `Users/${user._id.toString()}`,
    });
    return { message: "Account permanently deleted" };
  }
  async restoreAccount(
    userId: string,
    admin: HydratedDocument<IUser>,
  ): Promise<object> {
    if (admin.role !== RoleEnum.ADMIN)
      throw new ForbiddenException("Admins only");
    const user = await this.userRepository.findOneAndUpdate({
      filter: { _id: userId, paranoid: false },
      update: { restoredAt: new Date() },
    });
    if (!user) throw new NotFoundException("User not found or not deleted");
    return { message: "Account restored successfully" };
  }
}
export default new UserService();