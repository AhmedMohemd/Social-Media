import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import {
  ACCESS_SYSTEM_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_SYSTEM_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config/config";
import { RoleEnum, TokenTypeEnum } from "../enums";
import { BadRequestException, UnauthorizedException } from "../exceptions";
import { UserRepository } from "../../DB/repository";
import { redisService, RedisService } from "./redis.service";
import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../interfaces";
import { randomUUID } from "node:crypto";
type SignaturesType = { accessSignature: string; refreshSignature: string };
export class TokenService {
  private readonly userRepository: UserRepository;
  private readonly redis: RedisService;
  constructor() {
    this.userRepository = new UserRepository();
    this.redis = redisService;
  }
  sign = async ({
    payload,
    secret = ACCESS_USER_TOKEN_SIGNATURE,
    options,
  }: {
    payload: object;
    secret?: string;
    options?: SignOptions;
  }): Promise<string> => {
    return jwt.sign(payload, secret, options);
  };
  verify = async ({
    token,
    secret = ACCESS_USER_TOKEN_SIGNATURE,
    options,
  }: {
    token: string;
    secret?: string;
    options?: SignOptions;
  }): Promise<JwtPayload> => {
    return jwt.verify(token, secret) as JwtPayload;
  };
  detectSignatureLevel = async (role: RoleEnum): Promise<SignaturesType> => {
    let signatures: SignaturesType;
    switch (role) {
      case RoleEnum.ADMIN:
        signatures = {
          accessSignature: ACCESS_SYSTEM_TOKEN_SIGNATURE,
          refreshSignature: REFRESH_SYSTEM_TOKEN_SIGNATURE,
        };
        break;
      default:
        signatures = {
          accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
          refreshSignature: REFRESH_USER_TOKEN_SIGNATURE,
        };
        break;
    }
    return signatures;
  };
  getSignature = async (
    tokenType = TokenTypeEnum.ACCESS,
    signatureLevel: RoleEnum,
  ): Promise<string> => {
    const signatures = await this.detectSignatureLevel(signatureLevel);
    let signature;
    switch (tokenType) {
      case TokenTypeEnum.REFRESH:
        signature = signatures.refreshSignature;
        break;
      default:
        signature = signatures.accessSignature;
        break;
    }
    return signature;
  };
  decodeToken = async ({
    token,
    tokenType = TokenTypeEnum.ACCESS,
  }: {
    token: string;
    tokenType?: TokenTypeEnum;
  }): Promise<{
    user: HydratedDocument<IUser>;
    decoded: JwtPayload;
  }> => {
    const decoded = jwt.decode(token) as JwtPayload;

    if (!decoded?.aud?.length) {
      throw new BadRequestException("Missing token audience");
    }
    const [tokenApproach, signatureLevel] = decoded.aud;
    if (tokenApproach == undefined || signatureLevel == undefined) {
      throw new BadRequestException("Missing token audience");
    }
    if (tokenType != (tokenApproach as unknown as TokenTypeEnum)) {
      throw new BadRequestException(
        `Invalid token approach only ${tokenType} allowed for this endpoint`,
      );
    }
    if (
      decoded.jti &&
      (await this.redis.get(
        this.redis.revokeTokenKey({
          userId: decoded.sub as string,
          jti: decoded.jti,
        }),
      ))
    ) {
      throw new UnauthorizedException("Invalid login session");
    }
    const secret = await this.getSignature(
      tokenApproach as unknown as TokenTypeEnum,
      signatureLevel as unknown as RoleEnum,
    );
    const verifiedData = await this.verify({ token, secret });
    if (!verifiedData?.sub) {
      throw new BadRequestException("Invalid token payload");
    }
    const user = await this.userRepository.findOne({
      filter: {
        _id: verifiedData.sub,
      },
    });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    if (
      user.changeCredentialsTime &&
      user.changeCredentialsTime?.getTime() >=
        ((decoded.iat as number) || 0) * 1000
    ) {
      throw new UnauthorizedException("Invalid login session");
    }
    return { user, decoded };
  };
  createLoginCredentials = async (
    user: HydratedDocument<IUser>,
    issuer: string,
  ): Promise<{ access_token: string; refresh_token: string }> => {
    const { accessSignature, refreshSignature } =
      await this.detectSignatureLevel(user.role);
    const jwtid = randomUUID();
    const access_token = await this.sign({
      payload: { sub: user._id },
      secret: accessSignature,
      options: {
        issuer,
        audience: [
          TokenTypeEnum.ACCESS as unknown as string,
          user.role as unknown as string,
        ],
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        jwtid,
      },
    });
    const refresh_token = await this.sign({
      payload: { sub: user._id },
      secret: refreshSignature,
      options: {
        issuer,
        audience: [
          TokenTypeEnum.REFRESH as unknown as string,
          user.role as unknown as string,
        ],
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        jwtid,
      },
    });
    return { access_token, refresh_token };
  };
  createRevokeToken = async ({
    userId,
    jti,
    ttl,
  }: {
    userId: Types.ObjectId | string;
    jti: string;
    ttl: number;
  }) => {
    await this.redis.set({
      key: this.redis.revokeTokenKey({ userId, jti }),
      value: jti,
      ttl,
    });
    return;
  };
}