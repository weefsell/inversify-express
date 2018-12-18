import * as express from "express";
import { interfaces as inversifyInterfaces } from "inversify";

import { OutgoingHttpHeaders } from "http";

import {
    TYPE, DEFAULT_ROUTING_ROOT_PATH, PARAMETER_TYPE, DUPLICATED_CONTROLLER_NAME
} from "./constants";
import {
    AuthProvider, ConfigFunction, HttpContext, Middleware,
    MiddlewareFactory, RoutingConfig,
    BaseHttpController, BaseMiddleware, HttpResponseMessage
} from "./core";
import {
    ControllerMetadata,
    ControllerMethodMetadata, ControllerParameterMetadata,
    METADATA_KEY,
    ParameterMetadata
} from "./decorators";
import { Util } from "./util";

/**
 * Wrapper for the ExpressJS server. Provides an OOP class based approach with inversion of control
 * and dependency injection provided by the Inversify IoC framework.
 */
export class InversifyExpressServer<U = null> {

    //#region Private Attributes
    /**
     * Main dependency injection inversify Container
     */
    private container: inversifyInterfaces.Container;
    private router: express.Router;
    private app: express.Application;
    private configFn: ConfigFunction;
    private errorConfigFn: ConfigFunction;
    private routingConfig: RoutingConfig;
    private authProviderClass: inversifyInterfaces.Newable<AuthProvider<U>>;
    private forceControllers: boolean;
    //#endregion

    //#region Constructor
    /**
     * Wrapper for the express server.
     *
     * @param container Container loaded with all controllers and their dependencies.
     * @param customRouter optional express.Router custom router
     * @param routingConfig optional interfaces.RoutingConfig routing config
     * @param customApp optional express.Application custom app
     * @param authProviderClass optional interfaces.AuthProvider auth provider
     * @param forceControllers optional boolean setting to force controllers (defaults do true)
     */
    constructor(container: inversifyInterfaces.Container,
                customRouter?: express.Router | null,
                routingConfig?: RoutingConfig | null,
                customApp?: express.Application | null,
                authProviderClass?: inversifyInterfaces.Newable<AuthProvider<U>>,
                forceControllers = true) {

        this.container = container;
        this.forceControllers = forceControllers;
        this.router = customRouter || express.Router();
        this.routingConfig = routingConfig || {
            rootPath: DEFAULT_ROUTING_ROOT_PATH
        };
        this.app = customApp || express();

        if (authProviderClass) {

            this.authProviderClass = authProviderClass;
            container.bind<AuthProvider<U>>(TYPE.AuthProvider).to(this.authProviderClass).inRequestScope();
        }
    }
    //#endregion

    //#region Public Attributes
    /**
     * Sets the configuration function to be applied to the application.
     * Note that the config function is not actually executed until a call to InversifyExpresServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level middleware can be registered.
     */
    public setConfig(fn: ConfigFunction): InversifyExpressServer<U> {

        this.configFn = fn;
        return this;
    }

    /**
     * Sets the error handler configuration function to be applied to the application.
     * Note that the error config function is not actually executed until a call to InversifyExpresServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level error handlers can be registered.
     */
    public setErrorConfig(fn: ConfigFunction): InversifyExpressServer<U> {

        this.errorConfigFn = fn;
        return this;
    }

    /**
     * Applies all routes and configuration to the server, returning the express application.
     */
    public build(): express.Application {

        // The very first middleware to be invoked
        // it creates a new httpContext and attaches it to the
        // current request as metadata using Reflect
        this.app.all("*", async (req: express.Request, res: express.Response, next: express.NextFunction) => {

            const httpContext = await this.createHttpContext(req, res);
            Reflect.defineMetadata(METADATA_KEY.httpContext, httpContext, req);

            next();
        });

        // Register server-level middleware before anything else
        if (this.configFn) {
            this.configFn.apply(undefined, [this.app]);
        }

        // Register all the controllers handlers
        this.registerControllers();

        // Register error handlers after controllers
        if (this.errorConfigFn) {
            this.errorConfigFn.apply(undefined, [this.app]);
        }

        return this.app;
    }
    //#endregion

    //#region Private Methods
    /**
     * Registers all the handlers inside the controllers on an invokable way by the ExpressJS
     */
    private registerControllers(): void {

        // Fake HttpContext is needed during registration
        this.container.bind<HttpContext<U>>(TYPE.HttpContext).toConstantValue({} as any);


        // List of registered controllers constructors in the main container
        const controllersConstructors: Array<inversifyInterfaces.Newable<BaseHttpController>> = Util.getControllersFromMetadata();

        // For each controller constructor, give it a target name and bind it to the main container
        //  under the Controller TYPE and whenTargetNamed
        for (const constructor of controllersConstructors) {

            const name = constructor.name;

            if (this.container.isBoundNamed(TYPE.Controller, name)) {
                throw new Error(DUPLICATED_CONTROLLER_NAME(name));
            }

            this.container.bind(TYPE.Controller).to(constructor).whenTargetNamed(name);
        }

        // List of all the registered controllers instances
        const controllers: Array<BaseHttpController> = Util.getControllersFromContainer(this.container, this.forceControllers);

        //
        for (const controller of controllers) {

            const controllerConstructor: inversifyInterfaces.Newable<BaseHttpController> = controller.constructor as inversifyInterfaces.Newable<BaseHttpController>;

            // Controller metadata
            const controllerMetadata: ControllerMetadata = Util.getControllerMetadata(controllerConstructor);
            // Controller methods metadata
            const methodMetadata: Array<ControllerMethodMetadata> = Util.getControllerMethodMetadata(controllerConstructor);
            // Controller methods parameters metadata
            const parameterMetadata: ControllerParameterMetadata = Util.getControllerParameterMetadata(controllerConstructor);

            if (controllerMetadata != null && methodMetadata != null) {

                const controllerMiddleware = this.resolveMiddleware(...controllerMetadata.middleware);

                for (const metadata of methodMetadata) {

                    const paramList: ParameterMetadata[] = parameterMetadata != null && parameterMetadata[metadata.key] != null ? parameterMetadata[metadata.key] : [];

                    const handler: express.RequestHandler = this.handlerFactory(controllerMetadata.target.name, metadata.key, paramList);
                    const routeMiddleware = this.resolveMiddleware(...metadata.middleware);

                    this.router[metadata.method](
                        `${controllerMetadata.path}${metadata.path}`,
                        ...controllerMiddleware,
                        ...routeMiddleware,
                        handler
                    );
                }
            }
        }

        // Set the router to use
        this.app.use(this.routingConfig.rootPath, this.router);
    }

    /**
     * Resolve the middlewares for every http request handler for every controller. Also it
     * instantiate once every middleware to the de DI.
     *
     * @param middleware A list of middlewares to be resolved.
     * @return A list of plain {@link express.RequestHandler} that wraps the logic necessary
     * to construct the middlewares correctly.
     */
    private resolveMiddleware(...middleware: Middleware[]): express.RequestHandler[] {

        return middleware.map(middlewareItem => {

            // If the middleware item is not bound to the container and is a function, it is assumed it
            // is a plain express middleware function
            if (!this.container.isBound(middlewareItem as inversifyInterfaces.ServiceIdentifier<any>) &&
                typeof middlewareItem === "function") {

                return middlewareItem as express.RequestHandler;
            }
            // If the middlewareItem is an object, it is assumed its a MiddlewareFactory
            else if (typeof middlewareItem === "object") {

                // Middleware factory configuration
                const middlewareFactory: MiddlewareFactory = middlewareItem as MiddlewareFactory;

                // "Dummy instantiation" used to verify if the DI is correct
                {
                    this.container.get<BaseMiddleware>(middlewareFactory.identifier);
                }

                // A RequestHandler wrapper responsible for doing the instantiation logic of the
                //  middleware and setting the correct HttpContext and MiddlewareContext configured
                //  on the MiddlewareFactory
                return async (req: express.Request, res: express.Response, next: express.NextFunction) => {

                    // HTTP context of the request
                    const httpContext: HttpContext<U> = this.getHttpContext(req);
                    // Middleware instance
                    const middleware: BaseMiddleware = httpContext.container.get(middlewareFactory.identifier);

                    // Set the request HTTP context
                    Reflect.set(middleware, "httpContext", httpContext);
                    // Set the middleware context given in the MiddlewareFactory
                    Reflect.set(middleware, "middlewareContext", middlewareFactory.context);

                    // Invoke the middleware handler and catch exceptions and pass to the default
                    //  error handler
                    try {
                        await middleware.handler(req, res, next);
                    }
                    catch (e) {
                        next(e);
                    }
                };
            }
            // Else, its an identifier to a service bound to the DI container
            else {

                // "Dummy instantiation" used to verify if the DI is correct
                {
                    this.container.get<BaseMiddleware>(middlewareItem);
                }

                // A RequestHandler wrapper responsible for doing the instantiation logic of the
                //  middleware and setting the correct HttpContext
                return async (req: express.Request, res: express.Response, next: express.NextFunction) => {

                    // HTTP context of the request
                    const httpContext: HttpContext<U> = this.getHttpContext(req);
                    // Middleware instance
                    const middleware: BaseMiddleware = httpContext.container.get(middlewareItem);

                    // Set the request HTTP context
                    Reflect.set(middleware, "httpContext", httpContext);

                    // Invoke the middleware handler and catch exceptions and pass to the default
                    //  error handler
                    try {
                        await middleware.handler(req, res, next);
                    }
                    catch (e) {
                        next(e);
                    }
                };
            }
        });
    }

    private copyHeadersTo(headers: OutgoingHttpHeaders, target: express.Response) {
        for (const name of Object.keys(headers)) {
            const headerValue = headers[name];

            target.append(
                name,
                typeof headerValue === "number" ? headerValue.toString() : headerValue
            );
        }
    }

    private async handleHttpResponseMessage(message: HttpResponseMessage, res: express.Response) {
        this.copyHeadersTo(message.headers, res);

        if (message.content !== undefined) {
            this.copyHeadersTo(message.content.headers, res);

            res.status(message.statusCode)
            // If the content is a number, ensure we change it to a string, else our content is treated
            // as a statusCode rather than as the content of the Response
                .send(await message.content.readAsStringAsync());
        }
        else {
            res.sendStatus(message.statusCode);
        }
    }

    private handlerFactory(controllerName: any, key: string,
                           parameterMetadata: ParameterMetadata[]): express.RequestHandler {

        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {

            try {
                let args = this.extractParameters(req, res, next, parameterMetadata);

                const httpContext = this.getHttpContext(req);
                httpContext.container.bind<HttpContext<U>>(TYPE.HttpContext)
                    .toConstantValue(httpContext);

                // invoke controller's action
                const value: any = await httpContext.container.getNamed<any>(TYPE.Controller, controllerName)[key](...args);

                if (value instanceof HttpResponseMessage) {
                    await this.handleHttpResponseMessage(value, res);
                }
                else if (Util.instanceOfIHttpActionResult(value)) {
                    const httpResponseMessage = await value.executeAsync();
                    await this.handleHttpResponseMessage(httpResponseMessage, res);
                }
                else if (value instanceof Function) {
                    value();
                }
                else if (!res.headersSent) {
                    if (value === undefined) {
                        res.status(204);
                    }
                    res.send(value);
                }
            }
            catch (err) {
                next(err);
            }
        };
    }

    private getHttpContext(req: express.Request): HttpContext<U> {
        return Reflect.getMetadata(
            METADATA_KEY.httpContext,
            req
        );
    }

    /**
     * Creates and {@link HttpContext} object for the current request. Creates an child container and fetch
     * the user.
     * @param req The {@link express.Request} object of the HTTP request.
     * @param res The {@link express.Response} object of the HTTP request.
     *
     * @return The created {@link HttpContext} for the current request.
     */
    private async createHttpContext(req: express.Request, res: express.Response): Promise<HttpContext<U>> {

        // Child container for each request, so the bindings can be unique for every HTTP request and
        //  changes on the bindings inside the request does not affect other requests
        const childContainer: inversifyInterfaces.Container = this.container.createChild();
        // The current user for the request, may be null
        const principal: U = await this.getCurrentUser(req, res);

        return new HttpContext<U>(req, res, childContainer, principal);
    }

    /**
     * Fetches the current user, if any and if an application wide {@link authProviderClass} was set.
     * @param req The {@link express.Request} object of the HTTP request.
     * @param res The {@link express.Response} object of the HTTP request.
     *
     * @return The current logged in user fetched by the {@link authProviderClass}.
     */
    private async getCurrentUser(req: express.Request, res: express.Response): Promise<U> {

        // If an AuthProvider was set to use as an app wide middleware, invoke
        if (this.authProviderClass != null) {

            const authProvider = this.container.get<AuthProvider<U>>(TYPE.AuthProvider);
            return await authProvider.getUser(req, res);
        }

        // no AuthProvider, no way to get the user
        return null;
    }

    private extractParameters(req: express.Request, res: express.Response, next: express.NextFunction,
                              params: ParameterMetadata[]): any[] {
        let args: any[] = [];
        if (!params || !params.length) {
            return [req, res, next];
        }

        params.forEach(({type, index, parameterName, injectRoot}) => {
            switch (type) {
                case PARAMETER_TYPE.REQUEST:
                    args[index] = req;
                    break;
                case PARAMETER_TYPE.NEXT:
                    args[index] = next;
                    break;
                case PARAMETER_TYPE.PARAMS:
                    args[index] = this.getParam(req, "params", injectRoot, parameterName);
                    break;
                case PARAMETER_TYPE.QUERY:
                    args[index] = this.getParam(req, "query", injectRoot, parameterName);
                    break;
                case PARAMETER_TYPE.BODY:
                    args[index] = req.body;
                    break;
                case PARAMETER_TYPE.HEADERS:
                    args[index] = this.getParam(req, "headers", injectRoot, parameterName);
                    break;
                case PARAMETER_TYPE.COOKIES:
                    args[index] = this.getParam(req, "cookies", injectRoot, parameterName);
                    break;
                case PARAMETER_TYPE.PRINCIPAL:
                    args[index] = this.getPrincipal(req);
                    break;
                default:
                    args[index] = res;
                    break; // response
            }
        });

        args.push(req, res, next);
        return args;
    }

    private getParam(source: express.Request, paramType: string, injectRoot: boolean, name?: string) {
        if (paramType === "headers" && name) {
            name = name.toLowerCase();
        }
        let param = source[paramType];

        if (injectRoot) {
            return param;
        }
        else {
            return (param && name) ? param[name] : undefined;
        }
    }

    private getPrincipal(req: express.Request): U {
        return this.getHttpContext(req).user;
    }
    //#endregion
}
