import { PARAMETER_TYPE } from "../../constants";
import { params } from "./params.helper";

/**
 * @paramDecorator
 * Binds a method parameter to request.params object or to a specific parameter if a name is passed.
 * @param paramName The name of the param to retrieve
 */
export function RequestParam(paramName?: string): ParameterDecorator {
    return params(PARAMETER_TYPE.PARAMS, paramName);
}
