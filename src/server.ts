import "reflect-metadata"; // chạy đầu tiên để nhìn các decorators @IsEmail, @MinLength
import "dotenv/config";
import App from "./app";
import { IndexRoute } from "./modules/index";
import { validateEnv } from "./core/utils";
import UserRoute from "./modules/users/user.route";
import AuthRoute from "./modules/auth/auth.route";
import PostRoute from "./modules/posts/post.route";
import ChatRoute from "./modules/chats/chat.route";

validateEnv(); //validate trước khi tạo nếu nó empty thì báo luôn cho lóng 
const routes = [
    new IndexRoute(),
    new UserRoute(),
    new AuthRoute(),
    new PostRoute(),
    new ChatRoute(),
    
];
const app = new App(routes);

app.listen(); 