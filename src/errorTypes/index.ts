export class validationError extends Error {
  constructor(message: string) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, validationError.prototype);
  }
}

export interface errorProps {
  statusCode: number | 200;
  data: any[];
}
