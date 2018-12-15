import { interfaces as inversifyInterfaces } from "inversify";

import { BaseMiddleware } from "./base-middleware";
import { MiddlewareContext } from "./middleware-context.type";

/**
 * Representação de uma middleware factory
 */
export type MiddlewareFactory = {

    /**
     * Identificação do middleware
     */
    identifier: inversifyInterfaces.ServiceIdentifier<BaseMiddleware>;
    /**
     * Parâmetros do construtor a ser efetuado binding
     */
    context: MiddlewareContext;
}
