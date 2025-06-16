export interface ResponseDTO {
    status: 'ok' | 'error';
    message: string;
    body: any
}

export interface GetInitialSchoolResponse extends ResponseDTO {
    body: {
        school: {
            idEscuela: number;
            nombre: string;
            direccion: string;
            telefono: string;
            logo: string;
            color: string;
        };
        social: {
            mail: string;
            web: string;
            wpp: string;
            ig: string;
            in: string;
        }
    } | null;
};
