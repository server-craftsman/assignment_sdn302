import bcryptjs from "bcryptjs";
import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import {
  createToken,
  isEmptyObject,
  encodePasswordUserNormal,
  createTokenVerifiedUser,
} from "../../core/utils";
import { IUser, UserSchema } from "../user";
import { DataStoredInToken, TokenData } from "./auth.interface";
import LoginDto from "./dtos/login.dto";
import RegisterDto from "../user/dtos/register.dto";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"; // Import jwt

export default class AuthService {
  public userSchema = UserSchema;

  public async login(model: LoginDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "Model user is empty");
    }

    let emailCheck = model.email;

    const user = await this.userSchema.findOne({ email: emailCheck }).exec(); // find user by email by using exec() optimize query performance
    if (!user) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        `Your email: ${emailCheck} is not exists.`
      );
    }

    // login normal
    if (model.password) {
      const isMatchPassword = await bcryptjs.compare(
        model.password,
        user.password!
      ); // compare password user input with user password in database
      if (!isMatchPassword) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Your password is incorrect!`
        );
      }
    }

    if (!user.token_version) {
      user.token_version = 0;
    }

    const tokenData = createToken(user);

    // Save the refresh token to the user record
    user.refresh_token = tokenData.refresh_token;
    await user.save();

    return tokenData;
  }

  public async getCurrentLoginUser(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId).lean(); // find user by id by using lean() optimize memory performance
    if (!user) {
      throw new HttpException(HttpStatus.BAD_REQUEST, `User is not exists.`);
    }
    delete user.password;
    delete user.refresh_token;
    return user;
  }

  public async logout(userId: string): Promise<boolean> {
    const user = await this.userSchema.findById(userId);
    if (!user) {
      throw new HttpException(HttpStatus.BAD_REQUEST, `Cannot logout user!`);
    }

    user.token_version += 1;
    if (user.token_version >= Number.MAX_SAFE_INTEGER) {
      user.token_version = 0;
    }

    await user.save();
    return true;
  }

  public async refreshToken(refresh_token: string): Promise<TokenData> {
    if (!refresh_token) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        "Refresh token is required"
      );
    }

    try {
      const secret = process.env.JWT_TOKEN_SECRET!;
      const userToken = jwt.verify(refresh_token, secret) as DataStoredInToken;

      const user = await this.userSchema.findById(userToken.id);
      if (!user || user.token_version !== userToken.version) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          "Invalid refresh token"
        );
      }

      // Generate a new access token only
      const accessToken = createToken(user).access_token;
      delete user.refresh_token;

      // Return the new access token while keeping the existing refresh token
      return { access_token: accessToken, refresh_token: refresh_token! };
    } catch (error) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid refresh token");
    }
  }
}
