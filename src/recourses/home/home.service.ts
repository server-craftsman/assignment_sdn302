import { ProductService } from "../../modules/product";
import { CategoryService } from "../../modules/category";

export default class HomeService {
  private productService = new ProductService();
  private categoryService = new CategoryService();

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

  public async getAllProducts() {
    return this.productService.getItems();
  }

  public async getAllCategories() {
    return this.categoryService.getItems();
  }
}
