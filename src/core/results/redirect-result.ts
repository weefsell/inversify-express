import { MOVED_TEMPORARILY } from "http-status-codes";
import { URL } from "url";

import { BaseHttpController } from "../base-http-controller";
import { HttpResponseMessage } from "../http-response-message";
import { IHttpActionResult } from "./http-action-result.interface";

export class RedirectResult implements IHttpActionResult {

    private location: string | URL;

    private apiController: BaseHttpController<any>;

    constructor(location: string | URL, apiController: BaseHttpController<any>) {

        this.apiController = apiController;
        this.location = location;
    }

    public async executeAsync() {

        const response = new HttpResponseMessage(MOVED_TEMPORARILY);
        response.headers.location = this.location.toString();

        return response;
    }
}
