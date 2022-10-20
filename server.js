const scrap = require("./scrap");
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const app = new express();
const port = process.env.PORT || 8080;
const { pageNotFound, errorHandler } = require("./middlewares/error.middleware");
const { indexRouter } = require("./routes/index.route");
const { getApi } = require("./routes/api.route");


const fileName = path.join(__dirname, 'public/' + "right_to_work_check.pdf");
app.set('fileName', fileName);

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');


app.use(express.static(path.join(__dirname, '/static')));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`> "${req.originalUrl}"  User Agent: ${req.get('user-agent')}`);
  next();
})



app.use('/', indexRouter);
app.use('/api', getApi);




app.get("/api", (req, res) => {
  res.render('api',{
    layout:false
  });
})



app.use(pageNotFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("> " + "Listening to port " + port);
});
