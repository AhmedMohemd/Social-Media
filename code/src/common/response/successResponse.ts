import { type Response } from "express";
export const successResponse = <T>({
  data,
  res,
  status = 200,
  message = "Success",
}: {
  data?: T;
  status?: number;
  res: Response;
  message?: string;
}) => {
  return res.status(status).json({
    status,
    message,
    data,
  });
};