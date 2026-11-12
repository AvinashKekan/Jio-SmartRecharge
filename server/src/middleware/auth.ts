import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
declare global { namespace Express { interface Request { userId?: string } } }
export function requireAuth(req:Request,res:Response,next:NextFunction) {
  const token = req.cookies?.sr_token;
  if (!token) return res.status(401).json({error:"Authentication required"});
  try { const payload = jwt.verify(token,env.JWT_SECRET) as {sub:string}; req.userId=payload.sub; next(); }
  catch { return res.status(401).json({error:"Session expired or invalid"}); }
}
