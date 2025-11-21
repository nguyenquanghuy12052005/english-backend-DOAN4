import "reflect-metadata"; // chạy đầu tiên để nhìn các decorators @IsEmail, @MinLength
import "dotenv/config";
import App from "./app";
import { IndexRoute } from "./modules/index";
import { validateEnv } from "./core/utils";
import UserRoute from "./modules/users/user.route";
import AuthRoute from "./modules/auth/auth.route";
import PostRoute from "./modules/posts/post.route";
import ChatRoute from "./modules/chats/chat.route";
import VocalRoute from "./modules/vocal/vocal.route";
import QuizRoute from "./modules/quiz/quiz.route";
import "dotenv";
validateEnv(); //validate trước khi tạo nếu nó empty thì báo luôn cho lóng 
const routes = [
    new IndexRoute(),
    new UserRoute(),
    new AuthRoute(),
    new PostRoute(),
    new ChatRoute(),
    new VocalRoute(),
    new QuizRoute(),
    
    
    
];

// routes.forEach(route => {
//     console.log(`🔗 Registering route: ${route.path}`);

    
//     // Log tất cả các route con
//     route.router.stack.forEach((middleware: any) => {
//         if (middleware.route) {
//             const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
//             console.log(`   ${methods}${middleware.route.path}`);
//         }
//     });
// });
const app = new App(routes);

app.listen(); 