import { Router } from "express";
import { API_PATH } from "../../core/constants";
import { IRoute } from "../../core/interfaces";
import { authMiddleWare } from "../../core/middleware";
import AuthController from "./auth.controller";
// import LoginDto from './dtos/login.dto';
// import VerifiedTokenDto from './dtos/verifiedToken.dto';
// import RegisterDto from '../user/dtos/register.dto';
// import { UserRoleEnum } from '../user/user.enum';

export default class AuthRoute implements IRoute {
  public path = API_PATH.AUTH;
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // POST domain:/api/auth -> Login normal
    this.router.post(API_PATH.AUTH_LOGIN, this.authController.login);

    // GET domain:/api/auth -> Get Current Login User -> Require Login
    this.router.get(
      this.path,
      authMiddleWare([], true),
      this.authController.getCurrentLoginUser
    );

    // GET domain:/api/auth/logout -> Logout user
    this.router.get(
      API_PATH.AUTH_LOGOUT,
      authMiddleWare(),
      this.authController.logout
    );

    // POST domain:/api/auth/refresh-token -> Refresh token
    this.router.post(
      API_PATH.AUTH_REFRESH_TOKEN,
      this.authController.refreshToken
    );
  }
}
