import { ResponseDTO } from "./response.interface";

export interface LoginResponse extends ResponseDTO {
    body: {
        token: string;
    } | undefined;
}

export interface LoginData {
    dni: string;
    exp: number;
    expires: number;
    firstTime: number;
    iat: number;
    id: number;
    lastName: string;
    name: string;
    email: string;
    modules: {
        id: number,
        name?: string,
        permission?: "E" | "L"
        description: string;
        children?: {
            id:number;
            name:string;
            permission:"E"|"L";
            description:string;
        }[]
    }[],
    role: {
        id: number,
        name: string,
    }
    photo:string|null;
    course?:string;
}

export interface DecodedToken {
    dni: string;
    exp: number;
    expires: number;
    firstTime: number;
    iat: number;
    id: number;
    lastName: string;
    name: string;
    email: string;
    modules: {
        id: number,
        name: string,
        permission: "E" | "L"
    }[],
    role: {
        id: number,
        name: string,
    }
}

export interface Modules {
    id: number;
    name: string;
    permission: "E" | "L";
    description: string;
    parentModule: number | null;
    icon: string;
    children: Modules[] | null;
}