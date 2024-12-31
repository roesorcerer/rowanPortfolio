
export interface LogoStyle {
    backgroundColor: string;
    border: string;
    boxShadow: string;
    background?: string;
}

export interface Tag {
    id: number;
    name: string;
    path: string;
    githubLink?: string;
}

export interface Project {
    title: string;
    desc?: string;


    tags: Tag[];
}