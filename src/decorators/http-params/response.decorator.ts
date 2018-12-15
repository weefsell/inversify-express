import { PARAMETER_TYPE } from "../../constants";
import { params } from "./params.helper";

/**
 * @paramDecorator
 * Binds a method parameter to the response object.
 */
export function Response(): ParameterDecorator {
    return params(PARAMETER_TYPE.RESPONSE);
}
