import { Router } from "express";

import postController from "./controllers/postController.js";
import userController from "./controllers/userControler.js";

const routes = Router();

routes.use('/posts', postController);
routes.use('/users', userController);

export default routes;
