import { OK } from "http-status-codes";
import { injectable } from "inversify";
import { URL } from "url";

import { InjectHttpContext } from "../decorators";
import { HttpResponseMessage } from "./http-response-message";
import { HttpContext } from "./http-context";
import * as results from "./results";

@injectable()
export class BaseHttpController<U = null> {

    @InjectHttpContext()
    protected readonly httpContext: HttpContext<U>;

    protected created<T>(location: string | URL, content: T): results.CreatedNegotiatedContentResult<T> {
        return new results.CreatedNegotiatedContentResult(location, content, this);
    }

    protected conflict(): results.ConflictResult {
        return new results.ConflictResult(this);
    }

    protected ok<T>(content: T): results.OkNegotiatedContentResult<T>;
    protected ok(): results.OkResult;
    protected ok<T>(content?: T) {

        return content === undefined ? new results.OkResult(this) : new results.OkNegotiatedContentResult(content, this);
    }

    protected badRequest(): results.BadRequestResult;
    protected badRequest(message: string): results.BadRequestErrorMessageResult;
    protected badRequest(message?: string) {

        return message === undefined ? new results.BadRequestResult(this) : new results.BadRequestErrorMessageResult(message, this);
    }

    protected internalServerError(): results.InternalServerErrorResult;
    protected internalServerError(error: Error): results.ExceptionResult;
    protected internalServerError(error?: Error) {
        return error ? new results.ExceptionResult(error, this) : new results.InternalServerErrorResult(this);
    }

    protected notFound(): results.NotFoundResult {
        return new results.NotFoundResult(this);
    }

    protected redirect(uri: string | URL): results.RedirectResult {
        return new results.RedirectResult(uri, this);
    }

    protected responseMessage(message: HttpResponseMessage): results.ResponseMessageResult {
        return new results.ResponseMessageResult(message, this);
    }

    protected statusCode(statusCode: number): results.StatusCodeResult {
        return new results.StatusCodeResult(statusCode, this);
    }

    protected json(content: any, statusCode: number = OK): results.JsonResult {
        return new results.JsonResult(content, statusCode, this);
    }
}
