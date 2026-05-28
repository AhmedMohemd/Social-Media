"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const services_1 = require("../../common/services");
const token_service_1 = require("../../common/services/token.service");
const config_1 = require("../../config/config");
const enums_1 = require("../../common/enums");
const exceptions_1 = require("../../common/exceptions");
const repository_1 = require("../../DB/repository");
const repository_2 = require("../../DB/repository");
const security_1 = require("../../common/utils/security");
const object_Id_1 = require("../../common/utils/object.Id");
class UserService {
    redis;
    tokenService;
    userRepository;
    chatRepository;
    postRepository;
    s3;
    constructor() {
        this.redis = services_1.redisService;
        this.tokenService = new token_service_1.TokenService();
        this.userRepository = new repository_1.UserRepository();
        this.chatRepository = new repository_1.ChatRepository();
        this.postRepository = new repository_2.PostRepository();
        this.s3 = services_1.s3Service;
    }
    async profile(user) {
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
        const totalLikes = posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);
        const groups = await this.chatRepository.find({ filter: { type: enums_1.ChatEnum.ovm, participants: { $in: [user._id] } } });
        return {
            user: (populatedUser || user).toJSON(),
            stats: {
                postsCount: posts.length,
                totalLikes,
                friendsCount: user.friends?.length || 0,
            },
            groups
        };
    }
    async getOtherProfile(userId, currentUser) {
        const targetUser = await this.userRepository.findOne({
            filter: { _id: userId },
            projection: "firstName lastName profilePicture profileCoverPictures slug friends gender DOB",
        });
        if (!targetUser)
            throw new exceptions_1.NotFoundException("User not found");
        const isFriend = targetUser.friends?.some((f) => f.toString() === currentUser._id.toString());
        const posts = await this.postRepository.find({
            filter: {
                createdBy: (0, object_Id_1.toObjectId)(userId),
                availability: isFriend ? { $in: [0, 1] } : { $in: [0] },
            },
        });
        const totalLikes = posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);
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
                friendsCount: targetUser.friends?.length || 0,
            },
        };
    }
    async updateProfile(data, user) {
        const { firstName, lastName, phone, gender, DOB } = data;
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phone)
            user.phone = phone;
        if (gender !== undefined)
            user.gender = gender;
        if (DOB)
            user.DOB = DOB;
        await user.save();
        return user.toJSON();
    }
    async updatePassword({ oldPassword, password, }, user) {
        const isMatch = await (0, security_1.compareHash)({
            plaintext: oldPassword,
            cipherText: user.password,
        });
        if (!isMatch)
            throw new exceptions_1.BadRequestException("Old password is incorrect");
        user.password = password;
        user.changeCredentialsTime = new Date();
        await user.save();
        await this.redis.deleteKey(await this.redis.keys(this.redis.baseRevokeTokenKey(user._id)));
    }
    async profileCoverImages(files, user) {
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
    async profileImage({ ContentType, Originalname, }, user) {
        const { url } = await this.s3.createPreSignedUploadLink({
            path: `Users/${user._id.toString()}/Profile`,
            ContentType,
            Originalname,
        });
        user.profilePicture = url;
        await user.save();
        return { user: user.toJSON(), url };
    }
    async addFriend(friendId, user) {
        if (friendId === user._id.toString())
            throw new exceptions_1.BadRequestException("Cannot add yourself as friend");
        const friend = await this.userRepository.findOne({
            filter: { _id: friendId },
        });
        if (!friend)
            throw new exceptions_1.NotFoundException("User not found");
        const alreadyFriend = user.friends?.some((f) => f.toString() === friendId);
        if (alreadyFriend)
            throw new exceptions_1.ConflictException("Already friends");
        await this.userRepository.findOneAndUpdate({
            filter: { _id: user._id },
            update: { $addToSet: { friends: (0, object_Id_1.toObjectId)(friendId) } },
        });
        await this.userRepository.findOneAndUpdate({
            filter: { _id: friendId },
            update: { $addToSet: { friends: user._id } },
        });
        return { message: "Friend added successfully" };
    }
    async removeFriend(friendId, user) {
        await this.userRepository.findOneAndUpdate({
            filter: { _id: user._id },
            update: { $pull: { friends: (0, object_Id_1.toObjectId)(friendId) } },
        });
        await this.userRepository.findOneAndUpdate({
            filter: { _id: friendId },
            update: { $pull: { friends: user._id } },
        });
        return { message: "Friend removed successfully" };
    }
    async logout({ flag }, user, { jti, iat, sub }) {
        let status = 200;
        switch (flag) {
            case enums_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.redis.deleteKey(await this.redis.keys(this.redis.baseRevokeTokenKey(sub)));
                break;
            default:
                await this.tokenService.createRevokeToken({
                    userId: sub,
                    jti,
                    ttl: iat + config_1.REFRESH_TOKEN_EXPIRES_IN,
                });
                status = 201;
                break;
        }
        return status;
    }
    async rotateToken(user, { sub, jti, iat }, issuer) {
        if ((iat + config_1.ACCESS_TOKEN_EXPIRES_IN) * 1000 >= Date.now() + 30000) {
            throw new exceptions_1.ConflictException("Current access token still valid");
        }
        const remainingTtl = iat + config_1.REFRESH_TOKEN_EXPIRES_IN - Math.floor(Date.now() / 1000);
        await this.tokenService.createRevokeToken({
            userId: sub,
            jti,
            ttl: remainingTtl > 0 ? remainingTtl : 1,
        });
        return await this.tokenService.createLoginCredentials(user, issuer);
    }
    async softDeleteAccount(user) {
        await this.userRepository.findOneAndUpdate({
            filter: { _id: user._id },
            update: { deletedAt: new Date() },
        });
        return { message: "Account deactivated successfully" };
    }
    async deleteAccount(user) {
        const account = await this.userRepository.deleteOne({
            filter: { _id: user._id, force: true },
        });
        if (!account.deletedCount)
            throw new exceptions_1.NotFoundException("Invalid account");
        await this.s3.deleteFolderByPrefix({
            prefix: `Users/${user._id.toString()}`,
        });
        return { message: "Account permanently deleted" };
    }
    async restoreAccount(userId, admin) {
        if (admin.role !== enums_1.RoleEnum.ADMIN)
            throw new exceptions_1.ForbiddenException("Admins only");
        const user = await this.userRepository.findOneAndUpdate({
            filter: { _id: userId, paranoid: false },
            update: { restoredAt: new Date() },
        });
        if (!user)
            throw new exceptions_1.NotFoundException("User not found or not deleted");
        return { message: "Account restored successfully" };
    }
}
exports.UserService = UserService;
exports.default = new UserService();
