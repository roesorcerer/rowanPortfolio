# RowanBlog

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction

RowanBlog is a personal portfolio and blog application built using Angular and Bootstrap. The application showcases various projects, blog posts, and personal information, providing an elegant and responsive user experience.

## Features

- Responsive design using Bootstrap
- Dynamic routing and navigation with Angular
- Blog section for publishing articles
- Portfolio section to showcase projects
- Contact form for reaching out
- Deployment using GitHub Pages

## Technologies Used

- Angular
- Bootstrap
- Node.js
- Express
- Jekyll (for GitHub Pages deployment)
- GitHub Actions (for CI/CD)

## Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:

- Node.js (https://nodejs.org/)
- Angular CLI (https://angular.io/cli)
- Git (https://git-scm.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/roesorcerer/rowanPortfolio.git
   cd rowanPortfolio
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Angular CLI:**

   ```bash
   npm install -g @angular/cli
   ```

### Running the Application

1. **Start the development server:**

   ```bash
   ng serve
   ```

2. **Open your browser and navigate to:**

   ```bash
   http://localhost:4200
   ```

## Usage

- **Home Page:** Overview of the website.
- **About Page:** Information about the author.
- **Services Page:** Details of services offered.
- **Portfolio Page:** Showcase of projects.
- **Blog Page:** Collection of blog posts.
- **Contact Page:** Contact form to reach out.

## Deployment

This project uses GitHub Actions to automatically deploy the Jekyll site to GitHub Pages.

### GitHub Pages Deployment

1. **Create a GitHub repository and push your code:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/RowanBlog.git
   git push -u origin master
   ```

2. **Ensure you have a workflow file in `.github/workflows/deploy.yml`:**

   ```yaml
   name: Deploy Jekyll with GitHub Pages dependencies preinstalled

   on:
     push:
       branches: ["version2"]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         - name: Setup Pages
           uses: actions/configure-pages@v5
         - name: Build with Jekyll
           uses: actions/jekyll-build-pages@v1
           with:
             source: ./
             destination: ./_site
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3

     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

3. **Push to the `version2` branch:**

   ```bash
   git checkout -b version2
   git push origin version2
   ```

4. **Monitor the deployment in the Actions tab on GitHub.**

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Rowan Stratton - [My Email](mailto:rowanstratton1@gmail.com)

Project Link: [https://github.com/roesorcerer/rowanPortfolio](https://github.com/roesorcerer/rowanPortfolio)

