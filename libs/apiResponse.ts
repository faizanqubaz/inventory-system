import type { NextApiResponse } from "next";

export function successResponse(
  res: NextApiResponse,
  statusCode: number,
  message: string,
  data?: unknown
) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  });
}

export function errorResponse(
  res: NextApiResponse,
  statusCode: number,
  message: string
) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}