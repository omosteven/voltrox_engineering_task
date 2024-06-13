import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

import config from "../../config/config";

import UsersModel from "../models/users/users.model";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: "Token missing",
      });
    }

    const decodedToken = jwt.verify(token, config("jwt_key")) as {
      userId: string;
      email: string;
    };

    /*  --- 
        this operation below will run at a constant time O(1), 
        thus it will not have much effect on the time complexity of this middleware 
        ---
    **/

    const fetchUser = await UsersModel.findById(decodedToken?.userId).select(
      "token"
    );

    if (fetchUser?.token !== token) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized: invalid Token",
      });
    }

    req.body.user = decodedToken;

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({
      code: 401,
      message: "Unauthorized",
    });
  }
};

export default auth;