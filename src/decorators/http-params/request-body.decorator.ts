import { PARAMETER_TYPE } from "../../constants";
import { params } from "./params.helper";

/**
 * @paramDecorator
 * Binds a method parameter to request.body or to a specific body property if a name is passed. If
 * the bodyParser middleware is not used on the express app, this will bind the method parameter to
 * the express request object.
 */
export function RequestBody(): ParameterDecorator {
    return params(PARAMETER_TYPE.BODY);
}
