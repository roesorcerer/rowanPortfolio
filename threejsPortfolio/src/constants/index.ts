// src/constants/index.ts
import { Project } from '../types/constants';

export const navLinks = [
    {
      id: 1,
      name: 'Home',
      href: '#home',
    },
    {
      id: 2,
      name: 'About',
      href: '#about',
    },
    {
      id: 3,
      name: 'Work',
      href: '#work',
    },
    {
      id: 4,
      name: 'Contact',
      href: '#contact',
    },
  ];
  
  interface TeacherInfo {
    teacher: string;
    teacherWeb: string;
  }
  type Position = string | TeacherInfo[];
  interface ClassInfo {
    id: number;
    name: string;
    position: Position;
    img: string;
    description: string;
    link?: string; // Optional field since not all entries have it
    responsibilities: string[];
  }
  type Classes = ClassInfo[];

  export const classesTaught : Classes  = [

    {
      id: 1,
      name: 'Object Oriented Programming and Design',
      position: [
        {
          teacher:'Taught by: Eleazar Leal',
          teacherWeb: 'https://www.semanticscholar.org/author/Eleazar-Leal/12105092',
        }
        ],
      img: './src/public/assets/techlogos/oop.png',
      link: 'https://umd.catalog.prod.coursedog.com/courses/8268281',
      description:
        'Object Oriented Programming concepts. In this class we covered design principals relevant to designing programs. The information covered also includes concepts relevant to abstraction, interfaces, and data structures. This will prepare students to have an understanding on OOP concepts through language models.',
      responsibilities: [
          'Led weekly lab sessions',
          'Provided office hours support',
          'Graded assignments & exams',
          'Mentored student projects'
        ]
      },
    {
      id: 2,
      name: 'Intro to Programming in Python',
      position: [
        {
          teacher:'Taught by: Steven Holtz',
          teacherWeb: 'https://www.d.umn.edu/~sholtz/',
        }
        ],
      img: './src/public/assets/techlogos/python-computer.png',
      link: 'https://umd.catalog.prod.coursedog.com/courses/8204131',
      description:
        'Covering an introduction to programming concepts in Python. From standard best practices within the language to data requests. Within this class we cover the basics of Python.',
      responsibilities: [
          'Led weekly lab sessions',
          'Provided office hours support',
          'Graded assignments & exams',
          'Mentored student projects'
        ]
      },
    {
      id: 3,
      name: 'Intro to Computer Science',
      position: [
        {
          teacher:'Taught by: Dr. Thomas Buck',
          teacherWeb: 'https://www.tbuck.us/',
        }
        ],
      img: 'https://img.icons8.com/?size=100&id=RjabH8KjH5W7&format=png&color=000000',
      link: 'https://umd.catalog.prod.coursedog.com/courses/8268251',
      description:
        'An introduction to programming concepts in computer science in python. Teaching students the basics of programming and development.',
      responsibilities: [
          'Led weekly lab sessions',
          'Provided office hours support',
          'Graded assignments & exams',
          'Mentored student projects'
        ]
    },
  ];
  
  interface projectRef {
    texture : string,
  }

  //About Section Constants 
  export const gitLinks: Project[] = [
    {
        title: "My Portfolio",
        desc: "Personal portfolio website",
        tags: [
            {
                id: 1,
                name: "React",
                path: "./src/public/assets/techlogos/react.svg", 
                githubLink: "https://github.com/roesorcerer/ItascaCountyExplore"
            },
            {
                id: 2,
                name: "TypeScript",
                path: "./src/public/assets/techlogos/typescript.png", 
                githubLink: "https://github.com/roesorcerer/itascaprideNextJS"
            },
            {
              id: 3,
              name: "Flutter",
              path: "./src/public/assets/techlogos/icon_flutter.png", 
              githubLink: "https://github.com/roesorcerer/itascaprideNextJS"
          },
          {
            id: 4,
            name: "Python",
            path: "./src/public/assets/techlogos/python-logo.svg", 
            githubLink: "https://github.umn.edu/STRAT238/IntrotoCS"
        },
        {
          id: 5,
          name: "Javascript",
          path: "./src/public/assets/techlogos/javascript-logo.png", 
          githubLink: "https://github.umn.edu/STRAT238/IntrotoCS"
      },
      {
        id: 6,
        name: "C#",
        path: "./src/public/assets/techlogos/c-sharp-logo.png", 
        githubLink: "https://github.com/roesorcerer/AnimeRatingsWeb"
    },
    {
      id: 7,
      name: "Vue",
      path: "./src/public/assets/techlogos/vue-logo.png", 
      githubLink: "https://github.com/roesorcerer/RowanBlog/tree/version2/rowan-blog"
  },
  {
    id: 8,
    name: "Java",
    path: "./src/public/assets/techlogos/java-logo.png", 
    githubLink: "https://github.com/roesorcerer/Mobile2App-Inventory-App"
},
{
  id: 9,
  name: "OpenGL",
  path: "./src/public/assets/techlogos/Opengl-logo.svg.png", 
  githubLink: "https://github.com/roesorcerer/CS-330-CompGraphics/tree/week7"
},
            
        ]
    }
];

  export const myProjects = [
    {
      title: 'Pepper Bot - Exploring How Pitch Fluxations alter our emotional state',
      desc: 'With the help of the friendly Pepper Robot, our research team explored if changes in vocal tone may cause changes in skin conductivity values by assessing tonic data through an EDA sensor. The evaluation preformed allowed us to measure response from observed changes in readings. ',
      subdesc:
        'Pepper Bot`s actions were controlled through a development environment Choregraphe and Python was the language used within this IDE. All data collected was analyzed using Python with the help of Flirt packages.',
      href: 'https://www.canva.com/design/DAGbiM-HAVI/WZ-CaJB6td5N95ZZ12_WLA/watch?utm_content=DAGbiM-HAVI&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h94ed3c8e26',
      texture: './src/public/textures/project/voice-mod-pepper.mp4',
      logo: 'https://img.icons8.com/?size=100&id=ym8y5bBPBfO0&format=png&color=000000',
      logoStyle: {
        backgroundColor: '#C1A1B2',
        border: '0.2px solid #A3738C',
        boxShadow: '0px 0px 60px 0px #6F5764',
      },
      spotlight: './src/public/assets/pinkpowder.jpg',
      tags: [
        {
          id: 1,
          name: 'Python',
          path: './src/public/assets/techlogos/python-logo.svg',
        },
        {
          id: 2,
          name: 'Chorepgraphe Software',
          path: './src/public/assets/choregraphe-logo.svg',
        },
        {
          id: 3,
          name: 'Flirt Package',
          path: './src/public/assets/flirt-logo.png',
        },
        {
          id: 4,
          name: 'Data Analysis',
          path: 'https://img.icons8.com/?size=100&id=j1VehapaDMSP&format=png&color=000000',
        },
      ],
    },
    {
      title: 'Spam Detection SVM algorithm with dynamic feature selection',
      desc: 'LiveDoc is a powerful collaborative app that elevates the capabilities of real-time document editing. As an enhanced version of Google Docs, It supports millions of collaborators simultaneously, ensuring that every change is captured instantly and accurately.',
      subdesc:
        'With LiveDoc, users can experience the future of collaboration, where multiple contributors work together in real time without any lag, by using Next.js and Liveblocks newest features.',
      href: 'https://www.youtube.com/watch?v=y5vE8y_f_OM',
      texture: './src/public/textures/project/project2.mp4',
      logo: '/assets/project-logo2.png',
      logoStyle: {
        backgroundColor: '#13202F',
        border: '0.2px solid #17293E',
        boxShadow: '0px 0px 60px 0px #2F6DB54D',
      },
      spotlight: '/assets/spotlight2.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'assets/tailwindcss.png',
        },
        {
          id: 3,
          name: 'TypeScript',
          path: '/assets/typescript.png',
        },
        {
          id: 4,
          name: 'Framer Motion',
          path: '/assets/framer.png',
        },
      ],
    },
    {
      title: 'CarePulse - Health Management System',
      desc: 'An innovative healthcare platform designed to streamline essential medical processes. It simplifies patient registration, appointment scheduling, and medical record management, providing a seamless experience for both healthcare providers and patients.',
      subdesc:
        'With a focus on efficiency, CarePulse integrantes complex forms and SMS notifications, by using Next.js, Appwrite, Twillio and Sentry that enhance operational workflows.',
      href: 'https://www.youtube.com/watch?v=lEflo_sc82g',
      texture: './src/public/textures/project/project3.mp4',
      logo: '/assets/project-logo3.png',
      logoStyle: {
        backgroundColor: '#60f5a1',
        background:
          'linear-gradient(0deg, #60F5A150, #60F5A150), linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(208, 213, 221, 0.8) 100%)',
        border: '0.2px solid rgba(208, 213, 221, 1)',
        boxShadow: '0px 0px 60px 0px rgba(35, 131, 96, 0.3)',
      },
      spotlight: '/assets/spotlight3.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'assets/tailwindcss.png',
        },
        {
          id: 3,
          name: 'TypeScript',
          path: '/assets/typescript.png',
        },
        {
          id: 4,
          name: 'Framer Motion',
          path: '/assets/framer.png',
        },
      ],
    },
    {
      title: 'Horizon - Online Banking Platform',
      desc: 'Horizon is a comprehensive online banking platform that offers users a centralized finance management dashboard. It allows users to connect multiple bank accounts, monitor real-time transactions, and seamlessly transfer money to other users.',
      subdesc:
        'Built with Next.js 14 Appwrite, Dwolla and Plaid, Horizon ensures a smooth and secure banking experience, tailored to meet the needs of modern consumers.',
      href: 'https://www.youtube.com/watch?v=PuOVqP_cjkE',
      texture: './src/public/textures/project/project4.mp4',
      logo: '/assets/project-logo4.png',
      logoStyle: {
        backgroundColor: '#0E1F38',
        border: '0.2px solid #0E2D58',
        boxShadow: '0px 0px 60px 0px #2F67B64D',
      },
      spotlight: '/assets/spotlight4.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'assets/tailwindcss.png',
        },
        {
          id: 3,
          name: 'TypeScript',
          path: '/assets/typescript.png',
        },
        {
          id: 4,
          name: 'Framer Motion',
          path: '/assets/framer.png',
        },
      ],
    },
    {
      title: 'Imaginify - AI Photo Manipulation App',
      desc: 'Imaginify is a groundbreaking Software-as-a-Service application that empowers users to create stunning photo manipulations using AI technology. With features like AI-driven image editing, a payments system, and a credits-based model.',
      subdesc:
        'Built with Next.js 14, Cloudinary AI, Clerk, and Stripe, Imaginify combines cutting-edge technology with a user-centric approach. It can be turned into a side income or even a full-fledged business.',
      href: 'https://www.youtube.com/watch?v=Ahwoks_dawU',
      texture: './src/public/textures/project/project5.mp4',
      logo: '/assets/project-logo5.png',
      logoStyle: {
        backgroundColor: '#1C1A43',
        border: '0.2px solid #252262',
        boxShadow: '0px 0px 60px 0px #635BFF4D',
      },
      spotlight: '/assets/spotlight5.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'assets/tailwindcss.png',
        },
        {
          id: 3,
          name: 'TypeScript',
          path: '/assets/typescript.png',
        },
        {
          id: 4,
          name: 'Framer Motion',
          path: '/assets/framer.png',
        },
      ],
    },
  ];
  
  export const calculateSizes = (isSmall: any, isMobile: any, isTablet: any) => {
    return {
      
      /*Scale Individual Elements */ 
      shopScale: isSmall ? 1.5 : isMobile ? 1.5 : isTablet ? 1.8 : 2.4,
      coffeeCupScale: isSmall ? 2.5: isMobile ? 2.5 : isTablet ? 4.5 : 5,
      catShelfScale: isSmall ? NaN : isMobile ? 0.2 : isTablet ? 0.3 : 0.4,


      /**Position of the Shop */
      shopPositionX:  isSmall ? -0.9 : isMobile ? -0.9 : isTablet ? -0.7 : -0.3,
      shopPositionY: isSmall ? -0.9 : isMobile ? -1.2 : isTablet ? -2.2 : -3.5,
      shopPositionZ: isSmall ? -5.7 : isMobile ? -5.7 : isTablet ? -5.1 : -5.5,

      /**Rotation of Shop */
      shopRotationX: isSmall ? 3.5 : isMobile ? 3.5 : isTablet ? 3.5 : 3.3 ,
      shopRotationY: isSmall ? 2.1 : isMobile ? 2.1 : isTablet ? 2.2 : 2.1,
      shopRotationZ: isSmall ? 3.1 : isMobile ? 3.1 : isTablet ? 3.1 : 3.1,

      /*Position of Coffee Cup */
      coffeCupPositionX:  isSmall ? 0.9 : isMobile ? -4.4 : isTablet ? -5.3 : -6.1,
      coffeeCupPositionY: isSmall ? -3 : isMobile ? 2.4 : isTablet ? 2.2 : 0.9,
      coffeeCupPositionZ: isSmall ? 0.9 : isMobile ? -6.9 : isTablet ? -6.9 : -5.7,

      /*Rotation of Coffee Cup */
      coffeCupRotationX: isSmall ? 0.9 : isMobile ? -2.5 : isTablet ? -2.5 : 3.7 ,
      coffeCupRotationY: isSmall ? 0.9 : isMobile ? 3.1 : isTablet ? 3.1 : 3.1,
      coffeCupRotationZ: isSmall ? 0.9 : isMobile ? 2.9 : isTablet ? 2.9 : 2.9,

      /*Position of Cat Shelf */
      catShelfPositionX:  isSmall ? 0.9 : isMobile ? -4.4 : isTablet ? -5.3 : 5.1,
      catShelfPositionY: isSmall ? -3 : isMobile ? 2.4 : isTablet ? 2.2 : -3.5,
      catShelfPositionZ: isSmall ? 0.9 : isMobile ? -6.9 : isTablet ? -6.9 : -3.3,

      /*Rotation of Cat Shelf */
      catShelfRotationX: isSmall ? 0.9 : isMobile ? -2.5 : isTablet ? -2.5 : 3.3 ,
      catShelfRotationY: isSmall ? 0.9 : isMobile ? 3.1 : isTablet ? 3.1 : 1.7,
      catShelfRotationZ: isSmall ? 0.9 : isMobile ? 2.9 : isTablet ? 2.9 : 2.9,
      
      
      cubePosition: isSmall ? [4, -5, 0] : isMobile ? [5, -5, 0] : isTablet ? [5, -5, 0] : [9, -5.5, 0],
      reactLogoPosition: isSmall ? [3, 4, 0] : isMobile ? [5, 4, 0] : isTablet ? [5, 4, 0] : [12, 3, 0],
      ringPosition: isSmall ? [-5, 7, 0] : isMobile ? [-10, 10, 0] : isTablet ? [-12, 10, 0] : [-24, 10, 0],
      targetPosition: isSmall ? [-5, -10, -10] : isMobile ? [-9, -10, -10] : isTablet ? [-11, -7, -10] : [-13, -13, -10],
    };
  };
  
  export const workExperiences = [
    {
      id: 1,
      name: 'Framer',
      pos: 'Lead Web Developer',
      duration: '2022 - Present',
      title: "Framer serves as my go-to tool for creating interactive prototypes. I use it to bring designs to  life, allowing stakeholders to experience the user flow and interactions before development.",
      icon: '/assets/framer.svg',
      animation: 'victory',
    },
    {
      id: 2,
      name: 'Figma',
      pos: 'Web Developer',
      duration: '2020 - 2022',
      title: "Figma is my collaborative design platform of choice. I utilize it to work seamlessly with team members and clients, facilitating real-time feedback and design iterations. Its cloud-based.",
      icon: '/assets/figma.svg',
      animation: 'clapping',
    },
    {
      id: 3,
      name: 'Notion',
      pos: 'Junior Web Developer',
      duration: '2019 - 2020',
      title: "Notion helps me keep my projects organized. I use it for project management, task tracking, and as a central hub for documentation, ensuring that everything from design notes to.",
      icon: '/assets/notion.svg',
      animation: 'salute',
    },
  ];