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
import { CategoryRouteFE } from "./recourses/category";
import { ProductRouteFE } from "./recourses/product";

const routes = [
  //==================API Routes =========================================
  //   new IndexRoute(),
  new CategoryRoute(),
  new ProductRoute(),
  new UserRoute(),
  new AuthRoute(),
  //==================Template Engine Routes===============================
  new HomeRoute(),
  new CategoryRouteFE(),
  new ProductRouteFE(),
];

const app = new App(routes);

app.listen();
