export class RequestError extends Error {
  public status: number;
  public  message: string;

  constructor(status: number, message: string) {
    super(message)
    this.status = status;
    this.message = message;

    Object.setPrototypeOf(this, RequestError.prototype);
  }
}


export class IncompletePayloadError extends RequestError {
  constructor(payloadArgs?: Record<string, unknown>) {
    let msg = "Incomplete payload";
    if (payloadArgs && Object.keys(payloadArgs).length > 0) {
      msg += `: ${JSON.stringify(payloadArgs)}`;
    }
    
    super(400, msg)
  }
}
