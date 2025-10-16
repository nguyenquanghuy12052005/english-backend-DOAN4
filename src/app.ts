
import express from 'express';
import { Route } from './core/interface';
class App {
    public app: express.Application;
    public port: String | Number;

    constructor(routes: Route[]) {
        this.app = express();
        this.port = process.env.PORT || 5000; 
        
        this.initializeRoutes(routes);
    }  


    public listen() {
        this.app.listen(this.port, ()=>{
    console.log("chạy " + this.port)
}); 
    }


    private initializeRoutes(routes: Route[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }
}
export default App;