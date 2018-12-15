import { BAD_REQUEST } from "http-status-codes";

import { StringContent } from "../content";
import { BaseHttpController } from "../base-http-controller";
import { HttpResponseMessage } from "../http-response-message";
import { IHttpActionResult } from "./http-action-result.interface";

export class BadRequestErrorMessageResult implements IHttpActionResult {

    private apiController: BaseHttpController<any>;

    private message: string;

    constructor(message: string, apiController: BaseHttpController<any>) {

        this.message = message;
        this.apiController = apiController;
    }

    public async executeAsync(): Promise<HttpResponseMessage> {

        const response = new HttpResponseMessage(BAD_REQUEST);
        response.content = new StringContent(this.message);

        return response;
    }
}
