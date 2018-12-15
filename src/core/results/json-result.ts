import { JsonContent } from "../content";
import { BaseHttpController } from "../base-http-controller";
import { HttpResponseMessage } from "../http-response-message";
import { IHttpActionResult } from "./http-action-result.interface";

export class JsonResult implements IHttpActionResult {

    public readonly json: any;

    public readonly statusCode: number;

    private apiController: BaseHttpController<any>;

    constructor(json: any, statusCode: number, apiController: BaseHttpController<any>) {

        this.apiController = apiController;
        this.statusCode = statusCode;
        this.json = json;
    }

    public async executeAsync(): Promise<HttpResponseMessage> {

        const response = new HttpResponseMessage(this.statusCode);
        response.content = new JsonContent(this.json);

        return response;
    }

}
