import { NextResponse } from "next/server";
import { ErrorResponse } from "./ErrorResponse";

export type ApiResponse<T> = Promise<NextResponse<T | ErrorResponse>>