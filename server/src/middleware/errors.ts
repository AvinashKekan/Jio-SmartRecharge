import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function notFound(_req:Request,res:Response) {
  res.status(404).json({error:"Route not found"});
}

export function errorHandler(err:unknown,_req:Request,res:Response,_next:NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({error:"Invalid request", details:err.issues.map(issue=>({path:issue.path.join("."),message:issue.message}))});
  }
  const status = (err as {statusCode?:number})?.statusCode || 500;
  if (status >= 500) console.error(err);
  const message = err instanceof Error ? err.message : "Unexpected error";
  return res.status(status).json({error:status >= 500 ? "Internal server error" : message});
}
