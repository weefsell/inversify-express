import { Middleware } from "../../core";

export interface ControllerMetadata {
    path: string;
    middleware: Middleware[];
    target: any;
}
