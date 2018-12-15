import { HttpContent } from "./http-content";

const DEFAULT_MEDIA_TYPE = "application/json";

export class JsonContent extends HttpContent {

    private content: string;

    private mediaType: string;

    constructor(content: any);
    constructor(content: any, mediaType: string);
    constructor(content: any, mediaType: string = DEFAULT_MEDIA_TYPE) {
        super();
        this.mediaType = mediaType;

        this.content = JSON.stringify(content);

        this.headers["content-type"] = mediaType;
    }

    public readAsStringAsync(): Promise<string> {
        return Promise.resolve(this.content);
    }
}
