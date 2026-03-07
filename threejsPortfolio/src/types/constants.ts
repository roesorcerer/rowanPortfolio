
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

export interface ResearchPaper {
    title: string;
    authors: string[];
    venue: string;
    year: number;
    abstract: string;
    type: 'Published' | 'Thesis' | 'In Progress';
    link?: string;
    doi?: string;
    tags: string[];
    icon: string;
    iconStyle: LogoStyle;
    spotlight?: string;
}