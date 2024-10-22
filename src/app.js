const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');

const app = express();

// Define paths for public and node_modules directories
const publicDirectoryPath = path.join(__dirname, '../public');
const nodeModulesDirectoryPath = path.join(__dirname, '../node_modules');

// Serve the static content from the public and node_modules folders
app.use(express.static(publicDirectoryPath));
app.use(express.static(nodeModulesDirectoryPath));

// Define paths for views and partials
const viewsPath = path.join(__dirname, '../views');
const partialsPath = path.join(viewsPath, '/partials');

// Setup handlebars engine and views location
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(viewsPath, '/layouts'),
  partialsDir: partialsPath
}));

// Setting up Handlebars view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views/pages'));

// Home page route - setting to render HBS index and adding objects
app.get('/', (req, res) => {
  res.render('home', {
    layout: 'main',
    title: "Home",
    name: "Rowan Stratton"
  });
});

// About page route
app.get('/about', (req, res) => {
    res.render('about', {
    layout: 'main', // Assuming you want to use the 'main' layout
    title: "About Me", // Any other local variables you want to pass to the template
    name: "Rowan Stratton"
  });
});

// Port listener and confirmation message on console
app.listen(3000, () => {
    console.log("The server is running on port 3000");
});
