import { OK } from "http-status-codes";

import { BaseHttpController } from "../base-http-controller";
import { StringContent } from "../content";
import { HttpResponseMessage } from "../http-response-message";
import { IHttpActionResult } from "./http-action-result.interface";

export class OkNegotiatedContentResult<T> implements IHttpActionResult {

    private content: T;

    private apiController: BaseHttpController<any>;

    constructor(content: T, apiController: BaseHttpController<any>) {

        this.apiController = apiController;
        this.content = content;
    }

    public async executeAsync(): Promise<HttpResponseMessage> {

        const response = new HttpResponseMessage(OK);
        response.content = new StringContent(JSON.stringify(this.content), "application/json");

        return response;
    }
}
