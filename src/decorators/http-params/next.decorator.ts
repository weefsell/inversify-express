import { PARAMETER_TYPE } from "../../constants";
import { params } from "./params.helper";

/**
 * @paramDecorator
 * Binds a method parameter to the next() function.
 */
export function Next(): ParameterDecorator {
    return params(PARAMETER_TYPE.NEXT);
}
