import { Middleware } from "../../core";
import { HttpMethod } from "./http-method.decorator";

/**
 * @methodDecorator
 * Shortcut decorator which is a simply wrapper for {@link @HttpMethod}. Listen to POST HTTP verb.
 * @param path The path of the method. Will include the controller path.
 * @param middleware A list of middleware specific to this method.
 */
export function HttpPost(path: string, ...middleware: Middleware[]) {
    return HttpMethod("post", path, ...middleware);
}
