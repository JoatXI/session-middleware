import express from 'express';
import UserController from '../controller/userController.mjs';
import db from './db.mjs';

const usersRouter = express.Router();
const uController = new UserController(db);

usersRouter.post('/login', uController.findUSerByLogin.bind(uController));

// Logout route
usersRouter.post('/logout', uController.logoutUser.bind(uController));

// 'GET' login route - useful for clients to obtain currently logged in user
usersRouter.get('/login', uController.findUserBySession.bind(uController));

export default usersRouter;