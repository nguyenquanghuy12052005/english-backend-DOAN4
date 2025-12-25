import { Router } from "express";
import { Route } from "../../core/interface";
import UsersController from "./user.controller";

import RegisterDto from "./dtos/register.dtos";
import { adminMiddleware, authMiddleware, validationMiddleware } from "../../core/middleware";


export default class UserRoute implements Route {
    public path = "/api/users";
    public router = Router();

    public usersController = new UsersController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // ==================================================================
        // 1. AUTH ROUTES (Đăng ký, Đăng nhập, Admin) - ĐẶT LÊN ĐẦU
        // ==================================================================

        // Đăng ký User thường: POST http://localhost:5000/api/users
        this.router.post(this.path, validationMiddleware(RegisterDto, true), this.usersController.register);

        // Đăng ký Admin (MỚI): POST http://localhost:5000/api/users/admin/register
        // Dùng validation giống register thường
        this.router.post(this.path + '/admin/register', validationMiddleware(RegisterDto, true), this.usersController.registerAdmin);

        // Đăng nhập (MỚI): POST http://localhost:5000/api/users/login
        this.router.post(this.path + '/login', this.usersController.login);


        // ==================================================================
        // 2. FEATURE ROUTES (Paging, Progress) - ĐẶT TRƯỚC ID
        // ==================================================================

        // Paging: http://localhost:5000/api/users/paging?page=1&keyword=huy
        // Lưu ý: Route này PHẢI nằm trên route /:id
        this.router.get(this.path + '/paging', this.usersController.getAllUserPaging);

        // Lấy tất cả user
        this.router.get(this.path, this.usersController.getAllUser);


        // ==================================================================
        // 3. PARAM ROUTES (Các route có /:id) - ĐẶT CUỐI CÙNG
        // ==================================================================

        // Lấy user theo ID
        this.router.get(this.path + '/:id', this.usersController.getUserById);

        // Update User
        this.router.put(this.path + '/:id', authMiddleware, validationMiddleware(RegisterDto, true), this.usersController.updateUser);

        // Delete User (Cần quyền Admin)
        this.router.delete(this.path + '/:id', authMiddleware, adminMiddleware, this.usersController.deleteUser);

        // Thêm XP cho user
        this.router.post(this.path + '/:id/xp', authMiddleware, this.usersController.addXP);

        // Lấy tiến trình học tập
        this.router.get(this.path + '/:id/progress', authMiddleware, this.usersController.getUserProgress);

    }
}