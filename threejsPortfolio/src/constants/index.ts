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
                path: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iVioL8FIYuln28aphbBRvNekG1wsL70DTm4fz", 
                githubLink: "https://github.com/roesorcerer/ItascaCountyExplore"
            },
            {
                id: 2,
                name: "TypeScript",
                path: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61i3It7YJmRKduiL4GjrMaS7WNyEn9lFcOmJo1I", 
                githubLink: "https://github.com/roesorcerer/itascaprideNextJS"
            },
            {
              id: 3,
              name: "Flutter",
              path: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iwdX39YDceaNAfKUkhiIoPl7L2F93dZHyT16b", 
              githubLink: "https://github.com/roesorcerer/itascaprideNextJS"
          },
          {
            id: 4,
            name: "Python",
            path: ".https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iJQJbOrtbeWdTkrZvpuG4cEHimAMfwV1OlhtF", 
            githubLink: "https://github.umn.edu/STRAT238/IntrotoCS"
        },
        {
          id: 5,
          name: "Javascript",
          path: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iPNek7bHWbdyspk1c3jFhKQ0qDTnPv4RLU5IZ", 
          githubLink: "https://github.umn.edu/STRAT238/IntrotoCS"
      },
      {
        id: 6,
        name: "C#",
        path: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61ilR2duYrn10V5ZyuBp8Y9zDKfIbUw2POGxXFJ", 
        githubLink: "https://github.com/roesorcerer/AnimeRatingsWeb"
    },
    {
      id: 7,
      name: "Vue",
      path: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61i357HMSRKduiL4GjrMaS7WNyEn9lFcOmJo1IB", 
      githubLink: "https://github.com/roesorcerer/RowanBlog/tree/version2/rowan-blog"
  },
  {
    id: 8,
    name: "Java",
    path: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iSbVwSQxWMgwi4haH17qIATON6Q5E2myPSJRz", 
    githubLink: "https://github.com/roesorcerer/Mobile2App-Inventory-App"
},
{
  id: 9,
  name: "OpenGL",
  path: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iaFdvSjbjOAT5FG6SC2YNeRWt1JLox3pzDuhP", 
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
      texture: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iLTYlh4NVr61iBEq8NPvKn3YUD5kGmTcM2ylF',
      logo: 'https://img.icons8.com/?size=100&id=ym8y5bBPBfO0&format=png&color=000000',
      logoStyle: {
        backgroundColor: '#C1A1B2',
        border: '0.2px solid #A3738C',
        boxShadow: '0px 0px 60px 0px #6F5764',
      },
      spotlight: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iBf7jz1YheC9GHOXZN7uL45W0zxIqnFyiUgVc',
      tags: [
        {
          id: 1,
          name: 'Python',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iJQJbOrtbeWdTkrZvpuG4cEHimAMfwV1OlhtF',
        },
        {
          id: 2,
          name: 'Chorepgraphe Software',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iQszwflXFqcOkeuXZl9JDMNby7BFpoU03isPh',
        },
        {
          id: 3,
          name: 'Flirt Package',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iYWkmi1Lx6aPVdtUClEik9wDyjfIS7rg3NTGe',
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
      desc: 'This algorithm tests the hypothesis on if we can leverage the constantly changing spam patterns to improve algorithm. Based on prior hypothetical works our teams delved into testing SUpport Vector machines and their effectiveness with changing features. We tuned the model to bolster performance spread among two datasets. These sets held information on ways spam was detected so that our developed algorithm could pick up on trends. The observations showed a high bias toward non spam data at a detection result of 96%. The spam data classification fell shorter showing a detection of 85%. These results could be due to the imblace of data or the lack of adaquqte data. More research would be needed. We found that these results were promising for the realm of SVM showing the promise that there is room for improvement.',
      subdesc:
        'These results could be due to the imblace of data or the lack of adaquqte data. More research would be needed. We found that these results were promising for the realm of SVM showing the promise that there is room for improvement.',
      href: 'https://www.canva.com/design/DAGdRvzza-g/4mVplvWowVL99ch4qVpk8g/watch?utm_content=DAGdRvzza-g&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h80e457aea7',
      texture: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iFSunm9NgMn5vKoCWqIXRPiErsLjzZyO2ATtw',
      logo: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61inJX7QVOPezQoTgALHisB8EduJbfv4xct6q0y',
      logoStyle: {
        backgroundColor: '#13202F',
        border: '0.2px solid #17293E',
        boxShadow: '0px 0px 60px 0px #2F6DB54D',
      },
      spotlight: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iIc2opPJK6SbqtNzhvM1mIXaeYPZ9A5cr8gwu',
      tags: [
        {
          id: 1,
          name: 'Python',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iJQJbOrtbeWdTkrZvpuG4cEHimAMfwV1OlhtF',
        },
        {
          id: 2,
          name: 'Support Vector Machines',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iQ0YlQ0FqcOkeuXZl9JDMNby7BFpoU03isPhG',
        },
        {
          id: 3,
          name: 'Pandas',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61ihJwdh7AeO1qwAJbS2in9KxsdPHvz53BGjfZu',
        },
        {
          id: 4,
          name: 'SkLearn',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61i1JtTeH0NaX5s7P2ClbYRvo9kzFAwHBuZ6mV4',
        },
      ],
    },
    {
      title: 'Itasca Trails',
      desc: 'A way to explore the community in a scavenger type game. Sign up and see a bunch of pictures of locations across Itasca country. Use your reasoning and thinking skills to solve the riddle included with the picture. If you arrive at the location, you get points and to climb the ranking of the leaderboard.',
      subdesc:
        'Focusing on showcasing the beautiful sights and locations within Itasca county, to encourage members of the community to explore the space around them. Built with React and hosted on AWS.',
      href: 'https://www.canva.com/design/DAGeFSWQQi4/M2EkQEX6TorOLRcNpiQSWA/watch?utm_content=DAGeFSWQQi4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf6f67e9699',
      texture: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iWJGIVa4KIul0ig9brsNyHLo7xeYkATvq84BE',
      logo: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61irdynoti4OQMFfA8YsZN0XD9R1k5yV6pCE7mu',
      logoStyle: {
        backgroundColor: '#60f5a1',
        background:
          'linear-gradient(0deg, #60F5A150, #60F5A150), linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(208, 213, 221, 0.8) 100%)',
        border: '0.2px solid rgba(208, 213, 221, 1)',
        boxShadow: '0px 0px 60px 0px rgba(35, 131, 96, 0.3)',
      },
      spotlight: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61io0kALhd7j8yCn2ZwaoB9icNRMW36gHTeJQ54',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iVioL8FIYuln28aphbBRvNekG1wsL70DTm4fz',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iNOpg7IjJfgx6DTLz0VUks12cQaCbFyI459RP',
        },
        {
          id: 3,
          name: 'Azure',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61i6lAd8CncXmg8fEOqJa9TGd4Q0FBShL2kvriW',
        },
        {
          id: 4,
          name: 'Azure Sql Database',
          path: 'https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iWYlF2gA4KIul0ig9brsNyHLo7xeYkATvq84B',
        },
      ],
    },
    {
      title: 'Anime Rating Website',
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
      
      /**Camera Position */
      cameraPositionX: isSmall ? 1.0 : isMobile ? 1.1 : isTablet ? 1.2 : 1.3,
      cameraPositionY: isSmall ? 1.0 : isMobile ? 1.1 : isTablet ? 1.2 : 1.3,
      cameraPositionZ: isSmall ? 8 : isMobile ? 9 : isTablet ? 9.5 : 10,

      /*Scale Individual Elements */ 
      shopScale: isSmall ? 1.5 : isMobile ? 1.5 : isTablet ? 1.8 : 2.4,
      coffeeCupScale: isSmall ? 2.5: isMobile ? 2.5 : isTablet ? 4.5 : 5,
      catShelfScale: isSmall ? 0.1 : isMobile ? 0.15 : isTablet ? 0.18 : 0.2,


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
      catShelfPositionX: isSmall ? -3.5 : isMobile ? -4.0 : isTablet ? -4.5 : -5.0,
      catShelfPositionY: isSmall ? -4.9 : isMobile ? -3.0 : isTablet ? -2.8 : -4.5, 
      catShelfPositionZ: isSmall ? -4.0 : isMobile ? -4.5 : isTablet ? -5.0 : -5.5,

      /*Rotation of Cat Shelf */
      catShelfRotationX: isSmall ? 0.1 : isMobile ? 0.15 : isTablet ? 0.2 : 0.25,
      catShelfRotationY: isSmall ? -4.2 : isMobile ? -4.3 : isTablet ? -4.4 : -4.5,
      catShelfRotationZ: isSmall ? -6.0 : isMobile ? -6.1 : isTablet ? -6.2 : -6.3,
      
      
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