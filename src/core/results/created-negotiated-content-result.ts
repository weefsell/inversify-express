import { CREATED } from "http-status-codes";
import { URL } from "url";

import { StringContent } from "../content";
import { BaseHttpController } from "../base-http-controller";
import { HttpResponseMessage } from "../http-response-message";
import { IHttpActionResult } from "./http-action-result.interface";

export class CreatedNegotiatedContentResult<T> implements IHttpActionResult {

    private location: string | URL;

    private content: T;

    private apiController: BaseHttpController<any>;

    constructor(location: string | URL, content: T, apiController: BaseHttpController<any>) {

        this.apiController = apiController;
        this.content = content;
        this.location = location;
    }

    public async executeAsync(): Promise<HttpResponseMessage> {

        const response = new HttpResponseMessage(CREATED);
        response.content = new StringContent(JSON.stringify(this.content), "application/json");
        response.headers.location = this.location.toString();

        return response;
    }
}
