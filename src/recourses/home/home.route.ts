import { Router } from 'express';
import { IRoute } from '../../core/interfaces';
import HomeController from './home.controller';
import { authMiddleWare } from '../../core/middleware';

export default class HomeRoute implements IRoute {
    public path = '/';
    public router = Router();
    public homeController = new HomeController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Public routes
        this.router.get(this.path, this.homeController.getHome);
        this.router.get('/login', this.homeController.getLogin);
        
        // Protected route
        this.router.get('/products', authMiddleWare(), this.homeController.getProducts);
        this.router.get('/categories', authMiddleWare(), this.homeController.getCategories);
    }
}