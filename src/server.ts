import App from "./app";
import "dotenv/config";
//=======================API Routes=======================================
import { CategoryRoute } from "./modules/category";
import { ProductRoute } from "./modules/product";
// import { IndexRoute } from "./modules/index";
import { UserRoute } from "./modules/user";
import { AuthRoute } from "./modules/auth";
//=======================Template Engine==================================
import { HomeRoute } from "./recourses/home";

const routes = [
  //==================API Routes =========================================
  //   new IndexRoute(),
  new CategoryRoute(),
  new ProductRoute(),
  new UserRoute(),
  new AuthRoute(),
  //==================Template Engine Routes===============================
  new HomeRoute(),
];

const app = new App(routes);

app.listen();
