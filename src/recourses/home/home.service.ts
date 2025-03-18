import { ProductService } from "../../modules/product";
import { CategoryService } from "../../modules/category";
import AuthService from "../../modules/auth/auth.service";
import UserService from "../../modules/user/user.service";
import RegisterDto from "../../modules/user/dtos/register.dto";

export default class HomeService {
  private productService = new ProductService();
  private categoryService = new CategoryService();
  private authService = new AuthService();
  private userService = new UserService();

  public async getHomeData() {
    const [recentProducts, popularCategories] = await Promise.all([
      this.productService.getItems(),
      this.categoryService.getItems(),
    ]);

    return {
      recentProducts: recentProducts.slice(0, 6), // Show only 6 recent products
      popularCategories: popularCategories.slice(0, 4), // Show only 4 categories
    };
  }

  public async logout(user_id: string) {
    return this.authService.logout(user_id);
  }

  public async createUser(user_id: string, model: RegisterDto) {
    return this.userService.createUser(user_id, model);
  }
}
