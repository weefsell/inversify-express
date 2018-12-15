import { PARAMETER_TYPE } from "../../constants";
import { params } from "./params.helper";

/**
 * @paramDecorator
 * Binds a method parameter to request.query or to a specific query parameter if a name is passed.
 * @param queryParamName The name of the query parameter to retrieve.
 */
export function QueryParam(queryParamName?: string): ParameterDecorator {
    return params(PARAMETER_TYPE.QUERY, queryParamName);
}
