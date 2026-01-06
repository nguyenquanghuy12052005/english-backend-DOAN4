import { Router } from "express";
import { Route } from "../../core/interface";
import UsersController from "./user.controller";
import RegisterDto from "./dtos/register.dtos";
import { adminMiddleware, authMiddleware, validationMiddleware } from "../../core/middleware";
import SendFriendRequestDto from "./dtos/sendFriendRequest.dto";

export default class UserRoute implements Route {
    public path = "/api/users";
    public router = Router();
    public usersController = new UsersController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
       
        this.router.post(
            this.path, 
            validationMiddleware(RegisterDto, true), 
            this.usersController.register
        );

        // Đăng ký Admin: POST /api/users/admin/register
        this.router.post(
            `${this.path}/admin/register`, 
            validationMiddleware(RegisterDto, true), 
            this.usersController.registerAdmin
        );

        // Đăng nhập: POST /api/users/login
        this.router.post(`${this.path}/login`, this.usersController.login);

        // Lấy danh sách bạn bè: GET /api/users/my-friends
        this.router.get(
            `${this.path}/my-friends`, 
            authMiddleware, 
            this.usersController.getFriends
        );

        // Lấy danh sách yêu cầu chờ: GET /api/users/friend-requests/pending
        this.router.get(
            `${this.path}/friend-requests/pending`, 
            authMiddleware, 
            this.usersController.getPendingRequests
        );

       
        // Phân trang: GET /api/users/paging
        this.router.get(`${this.path}/paging`, this.usersController.getAllUserPaging);

        // Lấy tất cả user: GET /api/users
        this.router.get(this.path, this.usersController.getAllUser);

        // Gửi yêu cầu kết bạn: POST /api/users/friend-request
        this.router.post(
            `${this.path}/friend-request`, 
            authMiddleware, 
            validationMiddleware(SendFriendRequestDto, true), 
            this.usersController.sendFriendRequest
        );

       
        // Chấp nhận kết bạn
        this.router.post(
            `${this.path}/friend-request/:requestId/accept`, 
            authMiddleware, 
            this.usersController.acceptFriendRequest
        );

        // Từ chối kết bạn
        this.router.post(
            `${this.path}/friend-request/:requestId/reject`, 
            authMiddleware, 
            this.usersController.rejectFriendRequest
        );

        // Hủy yêu cầu đã gửi
        this.router.delete(
            `${this.path}/friend-request/:requestId`, 
            authMiddleware, 
            this.usersController.cancelFriendRequest
        );

        // Xóa bạn bè
        this.router.delete(
            `${this.path}/friends/:friendId`, 
            authMiddleware, 
            this.usersController.removeFriend
        );

       
        // Thêm XP cho user
        this.router.post(
            `${this.path}/:id/xp`, 
            authMiddleware, 
            this.usersController.addXP
        );
        
        // Lấy tiến trình học tập
        this.router.get(
            `${this.path}/:id/progress`, 
            authMiddleware, 
            this.usersController.getUserProgress
        );

       
        // Lấy user theo ID
        this.router.get(`${this.path}/:id`, this.usersController.getUserById);

        // Cập nhật User
        this.router.put(
            `${this.path}/:id`, 
            authMiddleware, 
            validationMiddleware(RegisterDto, true), 
            this.usersController.updateUser
        );

        // Xóa User (Admin)
        this.router.delete(
            `${this.path}/:id`, 
            authMiddleware, 
            adminMiddleware, 
            this.usersController.deleteUser
        );
    }
}