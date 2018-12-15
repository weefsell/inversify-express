import { PARAMETER_TYPE } from "../../constants";
import { params } from "./params.helper";

/**
 * @paramDecorator
 * Binds a method parameter to the request headers.
 * @param headerName The name of the header to retrieve
 */
export function RequestHeaders(headerName: string): ParameterDecorator {
    return params(PARAMETER_TYPE.HEADERS, headerName);
}
