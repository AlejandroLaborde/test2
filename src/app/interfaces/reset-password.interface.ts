export interface ResponseDTO {
    status: 'ok' | 'error';
    message: string;
    body: any
}

export interface GetUserToResetPasswordDTO extends ResponseDTO {
    body: {
        name: string;
        lastName: string;
        dni: string;
    } | undefined;
}