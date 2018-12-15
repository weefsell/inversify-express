import { INTERNAL_SERVER_ERROR } from "http-status-codes";

import { BaseHttpController } from "../base-http-controller";
import { HttpResponseMessage } from "../http-response-message";
import { StringContent } from "../content";
import { IHttpActionResult } from "./http-action-result.interface";

export class ExceptionResult implements IHttpActionResult {

    private error: Error;

    private apiController: BaseHttpController<any>;

    constructor(error: Error, apiController: BaseHttpController<any>) {

        this.apiController = apiController;
        this.error = error;
    }

    public async executeAsync(): Promise<HttpResponseMessage> {

        const response = new HttpResponseMessage(INTERNAL_SERVER_ERROR);
        response.content = new StringContent(this.error.toString());

        return response;
    }
}
