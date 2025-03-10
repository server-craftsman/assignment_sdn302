import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import connectDB from "./database";
import { ErrorMiddleware } from "./core/middleware";
import { IRoute } from "./core/interfaces";
import { logger } from "./core/utils";
import swaggerUi from "swagger-ui-express";
import path from "path";
import YAML from "yamljs";
import methodOverride from "method-override";

export default class App {
  public app: express.Application;
  public port: string | number;

  constructor(routes: IRoute[]) {
    this.app = express();
    this.initializeMiddlewares();
    this.connectToDatabase();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.port = process.env.PORT || 5000;
    this.initializeErrorHandling();
    this.initializeTemplateEngine();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server is running at port ${this.port}`);
    });
  }

  //connect to database
  private async connectToDatabase(): Promise<void> {
    try {
      await connectDB();
    } catch (error) {
      console.error("Failed to connect to database:", error);
      process.exit(1);
    }
  }

  //middleware
  private initializeMiddlewares(): void {
    this.app.use(
      cors({
        origin: process.env.CLIENT_URL || "http://localhost:5000",
        credentials: true,
      })
    );
    this.app.use(methodOverride("_method"));
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || "secret",
        resave: false,
        saveUninitialized: false,
        // cookie: {
        //   secure: process.env.NODE_ENV === "production",
        //   httpOnly: true,
        //   maxAge: 24 * 60 * 60 * 1000, // 24 hours
        // },
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(morgan("dev"));
    this.app.use(express.static(path.join(__dirname, "public")));
  }

  private initializeErrorHandling(): void {
    this.app.use(ErrorMiddleware);
  }

  private initializeRoutes(routes: IRoute[]): void {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });

    // config for swagger
    this.app.use(
      "/swagger",
      express.static(path.join(__dirname, "../node_modules/swagger-ui-dist"))
    );
  }

  private initializeTemplateEngine() {
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "./views"));
  }

  private initializeSwagger() {
    const swaggerPath = path.join(__dirname, "../swagger.yaml");
    const swaggerDocument = YAML.load(swaggerPath);
    swaggerDocument.host = process.env.DOMAIN_API;
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        swaggerOptions: {
          url: "/swagger/swagger.yaml",
        },
      })
    );
  }
}
