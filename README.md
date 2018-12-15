# inversify-express

Some utilities for the development of express applications with Inversify.

This package is based on the official [inversify-express-utils](https://github.com/inversify/inversify-express-utils), but have some bugs fixed and some new features.
Currently this package powers some big projects in our company, like ERP, BI and Site. 


#### Fixed Bugs from [inversify-express-utils](https://github.com/inversify/inversify-express-utils)

* BaseMiddleware bindings unique to HTTP request.
* Middlewares should be instantiated on every request. 
    * The middlewares were instantiated only once, even if they were not singletons, so the DI on the constructor could be broken if some dependency resolution depends on the scope of the request. 
    * Also, due to the old behavior, the `httpContext` inside the handler method of the middleware, changes its value during execution if the handler executes an async operation (very confusing and prone to bugs).
* Middlewares now can throw errors/exceptions safely. 
    * The old behavior was that if a middleware throws an error/exception, NodeJS would "crash" with an `unhandled promise rejection`. Now the errors are catch correctly and passed to `next(err)` to be handled by the default error handler.
    
#### New features

* Now we can pass a `context` in a per middleware configuration (global, per controller or per request), simulating a Middleware Factory (useful for role based authorization on per route, for example).
    * The context is set under the "middlewareContext" attribute of the `BaseMiddleware` and is available only after construction during the call to `handler()` method. 
    ```ts
        //Example:
        
        @Controller("/foo")
        class FooController extends BaseHttpController {
        
            //Look at the middleware factory
            @Post("/bar", {identifier: "someSymbol", context: {key: "value"}})
            public barPost() {
                //...some code
            }
        }
        
        class FooMiddleware extends BaseMiddleware {
        
            constructor() {
                super(); // Don't forget super call
            }
            
            handler(req, res, next): void | Promise<void> {
                
                this.httpContex; // Available and safe
                this.middlewareConxtext; // Available and is the same key/value passed on the @Post middlewares configuration
                
                // ...some diabolical mumbo-jumbo code executes here...
            }
        }
        
    ```
* The `user` of the HttpContext is a generic and can be set to anything you want (include not using at all) instead of the funky `Principal` interface.
* Added some documentation to classes, methods, code, etc.

#### Breaking Changes
* Controllers must extend `BaseHttpController<U>`.
    * Controllers receive an optional generic type to identify the type of the user.
* Middlewares must extend `BaseMiddleware`
* `InversifyExpressServer` now can have a generic type `U` to represent the user type instead of the old `Principal` interface (wich still exists).
* Decorators names are now **Pascal Case**
    * Despite of TypeScript documentation uses Camel Case, we prefer Pascal Case mainly because many of our developers have Angular background.
* `HttpContext` is now a class instead of a simple interface.
* Filenames now follow the **kebab-case** naming convention.
    * When working under Unix like systems, the case sensitive is not a problem. But if you start using Windows, filenames like <code>MyDecorator</code> and <code>myDecorator</code> simply does not work and causes confusion.
    * Also this is the recommended naming convention by Angular and we wanted to standardize.
    
#### Changes to the source
* `Files`, `folders` and `code` were refactored in a more "eye pleasant" way and some rules of thumbs were applied (e.g one export per file, no default export, barrel export). 

## The Basics

### Step 1: Decorate your controllers

To use a class as a "controller" for your express app, simply add the `@Controller` decorator to the class. Similarly, decorate methods of the class to serve as request handlers.

The following example will declare a controller that responds to `GET /foo'.

```ts
import * as express from "express";
import {
    Controller, 
    HttpGet, HttpPost, HttpDelete, 
    Request, QueryParam, Response, RequestParam 
} from "@weefsell/inversify-express/decorators";
import {
    BaseHttpController
} from "@weefsell/inversify-express/core
import { injectable, inject } from "inversify";

@controller("/foo")
export class FooController extends BaseHttpController {

    constructor(@inject("FooService") private fooService: FooService ) {}

    @HttpGet("/")
    private index(req: express.Request, res: express.Response, next: express.NextFunction): string {
        return this.fooService.get(req.query.id);
    }

    @HttpGet("/")
    private list(@QueryParam("start") start: number, @QueryParam("count") count: number): string {
        return this.fooService.get(start, count);
    }

    @HttpPost("/")
    private async create(@Request() req: express.Request, @Response() res: express.Response) {
        try {
            await this.fooService.create(req.body);
            res.sendStatus(201);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    @HttpDelete("/:id")
    private delete(@RequestParam("id") id: string, @Response() res: express.Response): Promise<void> {
        return this.fooService.delete(id)
            .then(() => res.sendStatus(204))
            .catch((err: Error) => {
                res.status(400).json({ error: err.message });
            });
    }
}
```

### Step 2: Configure container and server

Configure the inversify container in your composition root as usual.

Then, pass the container to the InversifyExpressServer constructor. This will allow it to register all controllers and their dependencies from your container and attach them to the express app.
Then just call server.build() to prepare your app.


```ts
import * as bodyParser from "body-parser";

import { Container } from "inversify";
import { 
    InversifyExpressServer
} from "@weefsell/inversify-express";

// declare metadata by @Controller annotation
import "./controllers/foo.controller";

// set up container
const container = new Container();

// set up bindings
container.bind<FooService>("FooService").to(FooService);

// create server
const server = new InversifyExpressServer(container);
server.setConfig((app) => {
  // add body parser
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
});

const app = server.build();
http.createServer(app).listen(3000);
//or if using https
//https.createServer(options, app).listen(3000);
```

## Important information about the @Controller decorator

:warning: Declaring a binding is not required for Controllers but **it is required to import the controller *one unique* time**. When the controller file is imported (e.g. `import "./controllers/some_controller"`) the class is declared and the metadata is generated. If you don't import it the metadata is never generated and therefore the controller is not found. An example of this can be found [here](https://github.com/inversify/inversify-express-example/blob/master/MongoDB/bootstrap.ts#L10-L11).

If you run the application multiple times within a shared runtime process (e.g. unit testing) you might need to clean up the existing metadata before each test.

```ts
import { Util } from "@weefsell/inversify-express";

describe("Some Component", () => {

    beforeEach(() => {
        Util.cleanUpMetadata();
    });

    it("Some test case", () => {
        // ...
    });

});
```

You can find an example of this in [our unit tests](https://github.com/inversify/inversify-express-utils/blob/master/test/framework.test.ts#L25-L29).

Inversify express will throw an exception if your application doesn't have controllers. You can disable this behaviour using the `forceControllers` option.

## InversifyExpressServer

A wrapper for an express Application.

### `.setConfig(configFn)`

Optional - exposes the express application object for convenient loading of server-level middleware.

```ts
import * as morgan from "morgan";
// ...
let server = new InversifyExpressServer(container);

server.setConfig((app) => {
    var logger = morgan('combined')
    app.use(logger);
});
```

### `.setErrorConfig(errorConfigFn)`

Optional - like `.setConfig()`, except this function is applied after registering all app middleware and controller routes.

```ts
let server = new InversifyExpressServer(container);
server.setErrorConfig((app) => {
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });
});
```

### `.build()`

Attaches all registered controllers and middleware to the express application. Returns the application instance.

```ts
// ...
let server = new InversifyExpressServer(container);
server
    .setConfig(configFn)
    .setErrorConfig(errorConfigFn)
    .build()
    .listen(3000, 'localhost', callback);
```

## Using a custom Router

It is possible to pass a custom `Router` instance to `InversifyExpressServer`:

```ts
let container = new Container();

let router = express.Router({
    caseSensitive: false,
    mergeParams: false,
    strict: false
});

let server = new InversifyExpressServer(container, router);
```

By default server will serve the API at `/` path, but sometimes you might need to use different root namespace, for
example all routes should start with `/api/v1`. It is possible to pass this setting via routing configuration to
`InversifyExpressServer`

```ts
let container = new Container();

let server = new InversifyExpressServer(container, null, { rootPath: "/api/v1" });
```

## Using a custom express application

It is possible to pass a custom `express.Application` instance to `InversifyExpressServer`:

```ts
let container = new Container();

let app = express();
//Do stuff with app

let server = new InversifyExpressServer(container, null, null, app);
```

## Decorators

### `@Controller(path, [middleware, ...])`

Registers the decorated class as a controller with a root path, and optionally registers any global middleware for this controller.

### `@HttpMethod(method, path, [middleware, ...])`

Registers the decorated controller method as a request handler for a particular path and method, where the method name is a valid express routing method.

### `@SHORTCUT(path, [middleware, ...])`

Shortcut decorators which are simply wrappers for `@HttpMethod`. Right now these include `@HttpGet`, `@HttpPost`, `@HttpPut`, `@HttpPatch`, `@HttpHead`, `@HttpDelete`, and `@All`. For anything more obscure, use `@HttpMethod`.

### `@Request()`

Binds a method parameter to the request object.

### `@Response()`

Binds a method parameter to the response object.

### `@RequestParam(name: string)`

Binds a method parameter to request.params object or to a specific parameter if a name is passed.

### `@QueryParam(name: string)`

Binds a method parameter to request.query or to a specific query parameter if a name is passed.

### `@RequestBody()`

Binds a method parameter to request.body or to a specific body property if a name is passed. If the bodyParser middleware is not used on the express app, this will bind the method parameter to the express request object.

### `@RequestHeaders(name: string)`

Binds a method parameter to the request headers.

### `@Cookies(name: string)`

Binds a method parameter to the request cookies.

### `@Next()`

Binds a method parameter to the next() function.

### `@Principal()`

Binds a method parameter to the user principal obtained from the AuthProvider.

## BaseHttpController

The `BaseHttpController` is a base class that provides a significant amount of helper functions in order to aid writing testable controllers.  When returning a response from a method defined on one of these controllers, you may use the `response` object available on the `httpContext` property described in the next section, or you may return an `HttpResponseMessage`, or you may return an object that implements the IHttpActionResult interface.

The benefit of the latter two methods are that since your controller is no longer directly coupled to requiring an httpContext to send a response, unit testing controllers becomes extraordinarily simple as you no longer need to mock the entire response object, you can simply run assertions on the returned value.  This API also allows us to make future improvements in this area and add in functionality that exists in similar frameworks (.NET WebAPI) such as media formatters, content negotation, etc.

```ts
import { injectable, inject } from "inversify";
import { 
    BaseHttpController, HttpResponseMessage, StringContent
} from "@weefsell/inversify-express/core";
import {
    Controller, HttpGet
} from "@weefsell/inversify-express/decorators";

@Controller("/")
class ExampleController extends BaseHttpController {
    
    @HttpGet("/")
    public async get() {
        const response = new HttpResponseMessage(200);
        response.content = new StringContent("foo");
        return response;
    }
```

On the BaseHttpController, we provide a litany of helper methods to ease returning common IHttpActionResults including

* OkResult
* OkNegotiatedContentResult
* RedirectResult
* ResponseMessageResult
* StatusCodeResult
* BadRequestErrorMessageResult
* BadRequestResult
* ConflictResult
* CreatedNegotiatedContentResult
* ExceptionResult
* InternalServerError
* NotFoundResult
* JsonResult

```ts
import { injectable, inject } from "inversify";
import { BaseHttpController } from "@weefsell/inverify-express/core";
import {
    Controller, HttpGet
} from "@weefsell/inverify-express/decorators";

@Controller("/")
class ExampleController extends BaseHttpController {
    
    @HttpGet("/")
    public async get() {
        return this.ok("foo");
    }
```

### JsonResult

In some scenarios, you'll want to set the status code of the response.
This can be done by using the `json` helper method provided by `BaseHttpController`.

```ts
import { BaseHttpController } from "@weefsell/inverify-express/core";
import {
    Controller, HttpGet
} from "@weefsell/inverify-express/decorators";

@Controller("/")
export class ExampleController extends BaseHttpController {
    
    @HttpGet("/")
    public async get() {
        const content = { foo: "bar" };
        const statusCode = 403;

        return this.json(content, statusCode);
    }
}
```

This gives you the flexability to create your own responses while keeping unit testing simple.

```ts
import { expect } from "chai";

import { ExampleController } from "./example-controller";
import { JsonResult } from "@weefsell/inversify-express/core";

describe("ExampleController", () => {
    
    let controller: ExampleController;

    beforeEach(() => {
        controller = new ExampleController();
    });

    describe("#get", () => {
        it("should have a status code of 403", async () => {
            const response = await controller.get();

            expect(response).to.be.an.instanceof(JsonResult);
            expect(response.statusCode).to.equal(403);
        });
    });
});
```
*This example uses [Mocha](https://mochajs.org) and [Chai](http://www.chaijs.com) as a unit testing framework*

## HttpContext

The `HttpContext` property allow us to access the current request,
response and user with ease. `HttpContext` is available as a property in controllers.

```ts
import { injectable, inject } from "inversify";
import { BaseHttpController } from "@weefsell/inverify-express/core";
import {
    Controller, HttpGet
} from "@weefsell/inverify-express/decorators";


@Controller("/")
class UserPreferencesController extends BaseHttpController {

    @inject("AuthService") private readonly _authService: AuthService;

    @HttpGet("/")
    public async get() {
        const token = this.httpContext.request.headers["x-auth-token"];
        return await this._authService.getUserPreferences(token);
    }
}
```

## AuthProvider

The `HttpContext` will not have access to the current user if you don't
create a custom `AuthProvider` implementation:

```ts
const server = new InversifyExpressServer(
    container, null, null, null, CustomAuthProvider
);
```

We need to implement the `AuthProvider` interface.

The `AuthProvider` allow us to get an user (`Principal`):

```ts
import { injectable, inject } from "inversify";
import { AuthProvider } from "@weefsell/inversify-express/core";

@injectable()
class CustomAuthProvider implements AuthProvider {

    private readonly someAuthService: AuthService;

    public async getUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): Promise<interfaces.Principal> {
    
        //... some diabolical mumbo-jumbo code executes here...
    }
}
```

We also need to implement the Principal interface.
The `Principal` interface allow us to:

- Access the details of an user
- Check if it has access to certain resource
- Check if it is authenticated
- Check if it is in an user role

```ts
class Principal implements interfaces.Principal {
    public details: any;
    public constructor(details: any) {
        this.details = details;
    }
    public isAuthenticated(): Promise<boolean> {
        return Promise.resolve(true);
    }
    public isResourceOwner(resourceId: any): Promise<boolean> {
        return Promise.resolve(resourceId === 1111);
    }
    public isInRole(role: string): Promise<boolean> {
        return Promise.resolve(role === "admin");
    }
}
```

We can then access the current user (Principal) via the `HttpContext`:

```ts
@controller("/")
class UserDetailsController extends BaseHttpController {

    @inject("AuthService") private readonly authService: AuthService;

    @httpGet("/")
    public async getUserDetails() {
        if (this.httpContext.user.isAuthenticated()) {
            return this.authService.getUserDetails(this.httpContext.user.details.id);
        } else {
            throw new Error();
        }
    }
}
```

## BaseMiddleware

`BaseMiddleware` allow us to inject dependencies
and to be access the current `HttpContext` in Express middleware function.

```ts
import { BaseMiddleware } from "@weefsell/inversify-express/core";

@injectable()
class LoggerMiddleware extends BaseMiddleware {
    
    @inject(TYPES.Logger) private readonly logger: Logger;
    
    public handler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
    
        if (this.httpContext.user.isAuthenticated()) {
            this.logger.info(`${this.httpContext.user.details.email} => ${req.url}`);
        } else {
            this.logger.info(`Anonymous => ${req.url}`);
        }
        
        next();
    }
}
```

We also need to declare some type bindings:

```ts
const container = new Container();

container.bind<Logger>(TYPES.Logger)
        .to(Logger);

container.bind<LoggerMiddleware>(TYPES.LoggerMiddleware)
         .to(LoggerMiddleware);

```

We can then inject `TYPES.LoggerMiddleware` into one of our controllers.

```ts
@injectable()
@Controller("/")
class UserDetailsController extends BaseHttpController {

    @inject("AuthService") private readonly authService: AuthService;

    @httpGet("/", TYPES.LoggerMiddleware)
    public async getUserDetails() {
        if (this.httpContext.user.isAuthenticated()) {
            return this.authService.getUserDetails(this.httpContext.user.details.id);
        } else {
            throw new Error();
        }
    }
}

container.bind<interfaces.Controller>(TYPE.Controller)
         .to(UserDetailsController)
         .whenTargetNamed("UserDetailsController");
```

### Request-scope services

Middleware extending `BaseMiddleware` is capable of re-binding services in the scope of a HTTP request.
This is useful if you need access to a HTTP request or context-specific property in a service that doesn't have
the direct access to them otherwise.

Consider the below `TracingMiddleware`. In this example we want to capture the `X-Trace-Id` header from the incoming request
and make it available to our IoC services as `TYPES.TraceIdValue`:

```ts
import { inject, injectable } from "inversify";
import { BaseHttpController, BaseMiddleware,  } from "@weefsell/inversify-express/core";
import { Controller, HttpGet } from "@weefsell/inversify-express/decorators";
import * as express from "express";

const TYPES = {
    TraceId: Symbol.for("TraceIdValue"),
    TracingMiddleware: Symbol.for("TracingMiddleware"),
    Service: Symbol.for("Service"),
};

@injectable()
class TracingMiddleware extends BaseMiddleware {

    public handler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        this.bind<string>(TYPES.TraceIdValue)
            .toConstantValue(`${ req.header('X-Trace-Id') }`);

        next();
    }
}

@Controller("/")
class TracingTestController extends BaseHttpController {

    constructor(@inject(TYPES.Service) private readonly service: Service) {
        super();
    }

    @HttpGet(
        "/",
        TYPES.TracingMiddleware
    )
    public getTest() {
        return this.service.doSomethingThatRequiresTheTraceID();
    }
}

@injectable()
class Service {
    constructor(@inject(TYPES.TraceIdValue) private readonly traceID: string) {
    }

    public doSomethingThatRequiresTheTraceID() {
        // ...
    }
}
```

The `BaseMiddleware.bind()` method will bind the `TYPES.TraceIdValue` if it hasn't been bound yet or re-bind if it has
already been bound.

## Route Map

If we have some controllers like for example:

```ts
@Controller("/api/user")
class UserController extends BaseHttpController {
    @HttpGet("/")
    public get() {
        return {};
    }
    @HttpPost("/")
    public post() {
        return {};
    }
    @HttpDelete("/:id")
    public delete(@RequestParam("id") id: string) {
        return {};
    }
}

@Controller("/api/order")
class OrderController extends BaseHttpController {
    @HttpGet("/")
    public get() {
        return {};
    }
    @HttpPost("/")
    public post() {
        return {};
    }
    @HttpDelete("/:id")
    public delete(@RequestParam("id") id: string) {
        return {};
    }
}
```

We can use the `prettyjson` function to see all the available enpoints:

```ts
import { getRouteInfo } from "inversify-express-utils";
import * as prettyjson from "prettyjson";

// ...

let server = new InversifyExpressServer(container);
let app = server.build();
const routeInfo = getRouteInfo(container);

console.log(prettyjson.render({ routes: routeInfo }));

// ...
```

> :warning: Please ensure that you invoke `getRouteInfo` after invoking `server.build()`!

The output formatter by `prettyjson` looks as follows:

```txt
routes:
  -
    controller: OrderController
    endpoints:
      -
        route: GET /api/order/
      -
        route: POST /api/order/
      -
        path: DELETE /api/order/:id
        route:
          - @requestParam id
  -
    controller: UserController
    endpoints:
      -
        route: GET /api/user/
      -
        route: POST /api/user/
      -
        route: DELETE /api/user/:id
        args:
          - @RequestParam id
```

## Examples

Some examples can be found at the [inversify-express-example](https://github.com/inversify/inversify-express-example) repository.

## Contributors

* [Giancarlo Dalle Mole](https://github.com/giancarlo-dalle-mole)

## License

License under the MIT License (MIT)

Copyright © 2018-2019 [WeefSell Sistemas - ME](https://github.com/weefsell)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
