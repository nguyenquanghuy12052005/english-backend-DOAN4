import { Router } from "express";
import { Route } from "../../core/interface"; 
import { GeminiController } from "./gemini.controller";

export default class GeminiRoute implements Route {
    public path = "/api/gemini";
    public router = Router();
    public geminiController = new GeminiController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST http://localhost:PORT/api/gemini/explain
        this.router.post(`${this.path}/explain`, this.geminiController.explainQuestion);
    }
}