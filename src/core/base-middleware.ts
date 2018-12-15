import * as express from "express";
import { injectable as Injectable, interfaces as inversifyInterfaces } from "inversify";

import { HttpContext } from "./http-context";
import { MiddlewareContext } from "./middleware-context.type";

/**
 * Extending BaseMiddleware allow us to inject dependencies and to access the current HttpContext in
 * Express middleware function.
 */
@Injectable()
export abstract class BaseMiddleware {

    //#region Protected Attributes
    /**
     * The context of the current HTTP call. Initialized when the middleware is invoked see
     * {@link Server.resolveMiddleware} in server.ts for more details
     */
    protected readonly httpContext: HttpContext;
    /**
     * The custom middleware context is used to set custom data depending on the handler being
     * executed. Useful for passing custom data to the middleware to perform authorization on a
     * specific route, for example.
     */
    protected readonly middlewareContext: MiddlewareContext;
    //#endregion

    //#region Constructor
    constructor() {}
    //#endregion

    //#region Public Methods
    /**
     * Middleware request handler. Same signature as {@link RequestHandler}
     * @param req The request object
     * @param res The response object
     * @param next The next function
     */
    public abstract handler(req: express.Request, res: express.Response, next: express.NextFunction): void | Promise<void>;
    //#endregion

    //#region Protected Methods
    /**
     * Shortcut to <code>this.httpContext.container.bind()</code>
     * @param serviceIdentifier Service identifier
     */
    protected bind<T>(serviceIdentifier: inversifyInterfaces.ServiceIdentifier<T>): inversifyInterfaces.BindingToSyntax<T> {

        return this.httpContext.container.bind(serviceIdentifier);
    }

    /**
     * Shortcut to <code>this.httpContext.container.bind()</code>
     * @param serviceIdentifier Service identifier
     */
    protected rebind<T>(serviceIdentifier: inversifyInterfaces.ServiceIdentifier<T>): inversifyInterfaces.BindingToSyntax<T> {

        return this.httpContext.container.rebind(serviceIdentifier);
    }
    //#endregion
}
