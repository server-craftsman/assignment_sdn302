import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../core/enums";
import { formatResponse } from "../../core/utils";
import { IUser } from "../user";
import { TokenData } from "./auth.interface";
import AuthService from "./auth.service";
import LoginDto from "./dtos/login.dto";

export default class AuthController {
  private authService = new AuthService();

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: LoginDto = req.body;
      const tokenData: TokenData = await this.authService.login(model);

      res.status(HttpStatus.OK).json(formatResponse<TokenData>(tokenData));
    } catch (error) {
      next(error);
    }
  };

  public getCurrentLoginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user: IUser = await this.authService.getCurrentLoginUser(
        req.user.id
      );
      res.status(HttpStatus.OK).json(formatResponse<IUser>(user));
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.logout(req.user.id);
      res
        .status(HttpStatus.OK)
        .json(formatResponse<string>("Logout successfully"));
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tokenData: TokenData = await this.authService.refreshToken(
        req.body.refresh_token
      );
      res.status(HttpStatus.OK).json(formatResponse<TokenData>(tokenData));
    } catch (error) {
      next(error);
    }
  };
}
