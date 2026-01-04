import { Router } from "express";
import { Route } from "../../core/interface";

import {  authMiddleware} from "../../core/middleware";
import VnPayController from "./vnpay.controller";


export default class VnPayRoute implements Route{
    public path ="/api/vnpay";
    public router = Router();

    public vnPayController = new VnPayController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() {
        console.log(this.path)
        this.router.post(this.path, authMiddleware, this.vnPayController.createQrVnPay); 

    }
} 