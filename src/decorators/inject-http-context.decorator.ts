import { inject } from "inversify";
import { TYPE } from "../constants";

/**
 * @propertyDecorator
 * Injects the {@link HttpContext} of the current request.
 */
export function InjectHttpContext() {
    return inject(TYPE.HttpContext);
}
