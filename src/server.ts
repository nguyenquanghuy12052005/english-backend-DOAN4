import "reflect-metadata";
import "dotenv/config";
import App from "./app";
import { IndexRoute } from "./modules/index";
import { validateEnv } from "./core/utils";
import UserRoute from "./modules/users/user.route";

validateEnv(); //validate trước khi tạo nếu nó empty thì báo luôn cho lóng 
const routes = [
    new IndexRoute(),
    new UserRoute()
];
const app = new App(routes);

app.listen(); 