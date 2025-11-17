import express from 'express';
import mongoose from 'mongoose';
import { Route } from './core/interface';
import hpp from 'hpp';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { Logger } from './core/utils';
import { errorMiddleware } from './core/middleware';

class App {
  public app: express.Application;
  public port: string | number;
  public production: Boolean;

  constructor(routes: Route[]) {
    this.app = express(); //Tạo HTTP server
    this.port = process.env.PORT || 5000;
    this.production = process.env.NODE_ENV =="production" ? true : false;

    
  
    this.connectToDatabase(); // Gọi kết nối DB
    this.initializeMiddleware();
    this.initializeRoutes(routes);
    this.initializeErrorMiddleware();
  }

  //hàm run
  public listen() {
    this.app.listen(this.port, () => {
       Logger.info("Server đang chạy tại cổng " + this.port);
    });
  }

  //duyệt hết các route truy cập vào 
  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use('/', route.router);
    });
  }

//bảo mật
  private initializeMiddleware() {
    if(this.production) {
        this.app.use(hpp()); //lọc giá trị trùng
        this.app.use(helmet());
        this.app.use(morgan('combined'));
        this.app.use(cors({origin: 'your.domain.com', credentials: true})); //chỉ cho phép domain chỉ định try cập  

    }
    else {
        this.app.use(morgan('dev'));
        this.app.use(cors({origin: true, credentials: true}));
    }
 
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));

  }

  private  initializeErrorMiddleware() {
    this.app.use(errorMiddleware);
  }

  // kết nối database
  private async connectToDatabase() {

         const connectString = process.env.MONGODB_URI;
         if(!connectString) {
             Logger.error("connectString invalid");      
            return;    
         }
      await mongoose.connect(connectString).catch((reason) => {
        Logger.error(reason);
      });
      Logger.info("Kết nối MongoDB Atlas thành công!");
    
  }
}

export default App;
