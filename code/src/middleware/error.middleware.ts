import type { Request, Response, NextFunction } from "express";
interface IError extends Error {
  statusCode: number;
}
export const globalErrorHandler = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error.name == "MulterError") {
    error.statusCode = 400;
  }
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message || "Internal Server Error",
    stack: error.stack, 
    cause: error.cause,
    error,
  });
  //   next();
};