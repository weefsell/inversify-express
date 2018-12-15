import * as express from "express";

export interface ConfigFunction {
    (app: express.Application): void;
}
