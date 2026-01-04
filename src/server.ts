import "reflect-metadata"; 
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
import GeminiRoute from "./modules/gemini/gemini.route";
import "dotenv";
import { VnPayRoute } from "./modules/vnpay";

validateEnv(); 

const routes = [
  new IndexRoute(),
  new UserRoute(),
  new AuthRoute(),
  new PostRoute(),
  new ChatRoute(),
  new VocalRoute(),
  new QuizRoute(),
  new VnPayRoute(),
  new GeminiRoute(),
];

const app = new App(routes);

app.listen();
