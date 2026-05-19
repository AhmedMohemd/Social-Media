import {
  ConfirmEmailDTO,
  LoginDTO,
  ResendConfirmEmailDTO,
  SignupDTO,
} from "./auth.dto";
import { IUser } from "../../common/interfaces";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exceptions";
import { UserRepository } from "../../DB/repository";
import { compareHash, generateHash } from "../../common/utils/security";
import { emailEvent, emailTemplate, sendEmail } from "../../common/utils/email";
import {
  notificationService,
  NotificationService,
  redisService,
  RedisService,
} from "../../common/services";
import { EmailEnum, ProviderEnum } from "../../common/enums";
import { createNumberOtp } from "../../common/utils/otp";
import { TokenService } from "../../common/services/token.service";
import { IloginResponse } from "./auth.entity";
import { CLIENT_ID } from "../../config/config";
import { OAuth2Client, TokenPayload } from "google-auth-library";
export class AuthenticationService {
  private readonly userRepository: UserRepository;
  private readonly redis: RedisService;
  private readonly tokenService: TokenService;
  private readonly notification: NotificationService;
  constructor() {
    this.userRepository = new UserRepository();
    this.tokenService = new TokenService();
    this.redis = redisService;
    this.notification = notificationService;
  }
  private async sendEmailOtp({
    email,
    subject,
    title,
  }: {
    email: string;
    subject: EmailEnum;
    title: string;
  }) {
    const isBlockedTTL = await this.redis.ttl(
      this.redis.blockOtpKey({ email, subject }),
    );
    if (isBlockedTTL > 0) {
      throw new BadRequestException(
        `Sorry we cannot request new otp while are blocked please try again after ${isBlockedTTL}`,
      );
    }
    const remainingOtpTTL = await this.redis.ttl(
      this.redis.otpKey({ email, subject }),
    );
    if (remainingOtpTTL > 0) {
      throw new BadRequestException(
        `Sorry we cannot request new otp while current otp still active please try again after ${remainingOtpTTL}`,
      );
    }
    const maxTrial = await this.redis.get(
      this.redis.maxAttemptOtpKey({ email, subject }),
    );
    if (maxTrial >= 3) {
      await this.redis.set({
        key: this.redis.blockOtpKey({ email, subject }),
        value: 1,
        ttl: 7 * 60,
      });
      throw new BadRequestException(`you have reached the max trial`);
    }
    const code = createNumberOtp();
    await this.redis.set({
      key: this.redis.otpKey({ email, subject }),
      value: await generateHash({ plaintext: `${code}` }),
      ttl: 120,
    });
    emailEvent.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject,
        html: emailTemplate({ code, title }),
      });
      await this.redis.incr(this.redis.maxAttemptOtpKey({ email, subject }));
    });
  }
  public async login(
    inputs: LoginDTO,
    issuer: string,
  ): Promise<IloginResponse> {
    const { email, password, FCM } = inputs;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: true },
      },
    });
    if (!user) {
      throw new BadRequestException("Invalid login credentials");
    }
    if (
      !(await compareHash({ plaintext: password, cipherText: user.password }))
    ) {
      throw new BadRequestException("Invalid login credentials");
    }
    if (FCM) {
      await this.redis.addFCM(user._id, FCM);
      const tokens = await this.redis.getFCMs(user._id);
      if (tokens?.length) {
        await this.notification.sendNotifications({
          tokens,
          data: { title: "Login", body: `New Login at ${new Date()}` },
        });
      }
    }
    return await this.tokenService.createLoginCredentials(user, issuer);
  }
  public async signup({
    email,
    username,
    password,
    phone,
  }: SignupDTO): Promise<IUser> {
    const checkUserExist = await this.userRepository.findOne({
      filter: { email },
      projection: "email",
      options: { lean: true },
    });
    if (checkUserExist) {
      throw new ConflictException("Email exist");
    }
    const user = await this.userRepository.createOne({
      data: {
        email,
        username,
        phone: phone as string,
        password,
      },
    });
    if (!user) {
      throw new BadRequestException("Fail");
    }
    this.sendEmailOtp({
      email,
      subject: EmailEnum.CONFIRM_EMAIL,
      title: "Confirm your email",
    });
    return user.toJSON();
  }
  public async confirmEmail({ email, otp }: ConfirmEmailDTO) {
    const hashOtp = await this.redis.get(
      this.redis.otpKey({ email, subject: EmailEnum.CONFIRM_EMAIL }),
    );
    if (!hashOtp) {
      throw new BadRequestException("Expired otp");
    }
    const account = await this.userRepository.findOne({
      filter: {
        email,
        confirmEmail: { $exists: false },
        provider: ProviderEnum.SYSTEM,
      },
    });
    if (!account) {
      throw new BadRequestException("Fail to find matching account");
    }
    if (!(await compareHash({ plaintext: otp, cipherText: hashOtp }))) {
      throw new ConflictException("Invalid otp");
    }
    account.confirmEmail = new Date();
    await account.save();
    await this.redis.deleteKey(
      await this.redis.keys(this.redis.otpKey({ email })),
    );
    return;
  }
  public async resendConfirmEmail({ email }: ResendConfirmEmailDTO) {
    const account = await this.userRepository.findOne({
      filter: {
        email,
        confirmEmail: { $exists: false },
        provider: ProviderEnum.SYSTEM,
      },
    });
    if (!account) {
      throw new BadRequestException("Fail to find matching account");
    }
    await this.sendEmailOtp({
      email,
      subject: EmailEnum.CONFIRM_EMAIL,
      title: "Verify Email",
    });
    return;
  }
  public async requestForgotPassword({ email }: ResendConfirmEmailDTO) {
    const account = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: true },
      },
    });
    if (!account) {
      throw new NotFoundException("Account not found");
    }
    await this.sendEmailOtp({
      email,
      subject: EmailEnum.FORGOT_PASSWORD,
      title: "Reset your password",
    });
    return;
  }
  public async verifyForgotPasswordOtp({ email, otp }: ConfirmEmailDTO) {
    const hashOtp = await this.redis.get(
      this.redis.otpKey({ email, subject: EmailEnum.FORGOT_PASSWORD }),
    );
    if (!hashOtp) {
      throw new BadRequestException("Expired otp");
    }
    const account = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
      },
    });
    if (!account) {
      throw new NotFoundException("Account not found");
    }
    if (!(await compareHash({ plaintext: otp, cipherText: hashOtp }))) {
      throw new ConflictException("Invalid otp");
    }
    await this.redis.set({
      key: this.redis.otpKey({
        email,
        subject: EmailEnum.FORGOT_PASSWORD,
      }),
      value: 1,
      ttl: 5 * 60,
    });
    return;
  }
  public async resetForgotPasswordOtp({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const isVerified = await this.redis.get(
      this.redis.otpKey({
        email,
        subject: EmailEnum.FORGOT_PASSWORD,
      }),
    );
    if (!isVerified) {
      throw new BadRequestException("OTP not verified");
    }
    const account = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
      },
    });
    if (!account) {
      throw new NotFoundException("Account not found");
    }
    account.password = await generateHash({ plaintext: password });
    await account.save();
    await this.redis.deleteKey(
      await this.redis.keys(
        this.redis.otpKey({ email, subject: EmailEnum.FORGOT_PASSWORD }),
      ),
    );
    return;
  }
  private async verifyGoogleAccount(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new BadRequestException("Invalid token payload");
    }
    return payload;
  }
  async loginWithGmail(idToken: string, issuer: string) {
    const payload = await this.verifyGoogleAccount(idToken);
    const user = await this.userRepository.findOne({
      filter: {
        email: payload.email as string,
        provider: ProviderEnum.GOOGLE,
      },
    });
    if (!user) {
      throw new NotFoundException(
        "Invalid account provider or not register account",
      );
    }
    return await this.tokenService.createLoginCredentials(user, issuer);
  }
  async signupWithGmail(idToken: string, issuer: string) {
    const payload = await this.verifyGoogleAccount(idToken);
    const checkExist = await this.userRepository.findOne({
      filter: {
        email: payload.email as string,
      },
    });
    console.log({ checkExist });
    if (checkExist) {
      if (checkExist.provider != ProviderEnum.GOOGLE) {
        throw new ConflictException("Invalid account provider");
      }
      return {
        status: 200,
        credentials: await this.loginWithGmail(idToken, issuer),
      };
    }
    const account = await this.userRepository.createOne({
      data: {
        firstName: payload.given_name as string,
        lastName: payload.family_name as string,
        email: payload.email as string,
        profilePicture: payload.picture as string,
        confirmEmail: new Date(),
        provider: ProviderEnum.GOOGLE,
      },
    });
    return {
      status: 201,
      credentials: await this.tokenService.createLoginCredentials(
        account,
        issuer,
      ),
    };
  }
}
export default new AuthenticationService();