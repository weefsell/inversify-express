import { NOT_FOUND } from "http-status-codes";

import { BaseHttpController } from "../base-http-controller";
import { HttpResponseMessage } from "../http-response-message";
import { IHttpActionResult } from "./http-action-result.interface";

export class NotFoundResult implements IHttpActionResult {

    private apiController: BaseHttpController<any>;

    constructor(apiController: BaseHttpController<any>) {

        this.apiController = apiController;
    }

    public async executeAsync(): Promise<HttpResponseMessage> {

        return new HttpResponseMessage(NOT_FOUND);
    }
}
