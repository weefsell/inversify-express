import { Middleware } from "../../core";
import { HttpMethod } from "./http-method.decorator";

/**
 * @methodDecorator
 * Shortcut decorator which is a simply wrapper for {@link @HttpMethod}. Listen to all HTTP verbs.
 * @param path The path of the method. Will include the controller path.
 * @param middleware A list of middleware specific to this method.
 */
export function All(path: string, ...middleware: Middleware[]) {
    return HttpMethod("all", path, ...middleware);
}
