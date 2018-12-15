import * as express from "express";

export interface AuthProvider<U> {

    getUser(req: express.Request, res?: express.Response): Promise<U>;
}
