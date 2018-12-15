import { Middleware } from "../../core";
import { HttpMethod } from "./http-method.decorator";

/**
 * @methodDecorator
 * Shortcut decorator which is a simply wrapper for {@link @HttpMethod}. Listen to DELETE HTTP verb.
 * @param path The path of the method. Will include the controller path.
 * @param middleware A list of middleware specific to this method.
 */
export function HttpDelete(path: string, ...middleware: Middleware[]) {
    return HttpMethod("delete", path, ...middleware);
}
