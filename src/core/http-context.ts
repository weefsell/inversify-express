import * as express from "express";
import { interfaces as inversifyInterfaces } from "inversify";

/**
 * @note Not meant to be instantiated directly.
 * The HTTP context for every request. Has access to the current Request and Response objects and
 * the child Container for the request.
 * If an {@link AuthProvider} was set to be used app wide, the {@link user} will be set with the result
 * of {@link AuthProvider.getUser()} method.
 */
export class HttpContext<U = null> {

    //#region Public Attributes
    /**
     * The {@link express.Request} object for the current HTTP request.
     */
    public readonly request: express.Request;
    /**
     * The {@link express.Response} object for the current HTTP request.
     */
    public readonly response: express.Response;
    /**
     * The child {@link #inversifyInterfaces.Container Container} for the current HTTP request.
     */
    public readonly container: inversifyInterfaces.Container;
    //#endregion

    //#region Properties
    /**
     * Current logged in user, if any.
     */
    private _user: U;
    //#endregion

    //#region Constructor
    constructor(request: express.Request, response: express.Response,
                container: inversifyInterfaces.Container, user?: U) {

        this.request = request;
        this.response = response;
        this.container = container;
        this._user = user;
    }
    //#endregion

    //#region Public Getters and Setters
    /**
     * Current logged in user, if any. Set automatically only if an {@link AuthProvider} was set to
     * be used app wide. Can be set using custom middlewares per request, per controller or app wide.
     */
    public get user(): U {
        return this._user;
    }

    public set user(value: U) {

        if (this._user != null && !Boolean(process.env.AUTH_SUPPRESS_USER_RESET)) {
            console.warn("An user is already set. Setting again may be a mistake. Set the environment var \"AUTH_SUPPRESS_USER_RESET\" to suppress this warning.");
        }

        this._user = value;
    }
    //#endregion
}
