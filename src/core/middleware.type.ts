import { interfaces as inversifyInterfaces } from "inversify";
import { BaseMiddleware } from "./base-middleware";
import * as express from "express";
import { MiddlewareFactory } from "./middleware-factory";

/**
 * Middleware type definition
 */
export type Middleware = (MiddlewareFactory | inversifyInterfaces.ServiceIdentifier<BaseMiddleware> | express.RequestHandler);
