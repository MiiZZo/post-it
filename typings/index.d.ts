import { Request, Response } from "express";

interface ExpressRequest extends Request {
  session: any;
}
interface ExpressResponse extends Response {}
