const scrap = require("./scrap");
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const app = new express();
const port = process.env.PORT || 8080;
const fs = require('fs');
const { login } = require('./login.js');
const { pageNotFound, errorHandler } = require("./middlewares/error.middleware");
const { indexRouter } = require("./routes/index.route");


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



app.route('/login')
  .get((error, req, res) => {
    // next(new Error("no"));
    throw new Error("O noe");
  })

app.get('/userAgent', (req, res) => {
  res.send(req.get('user-agent'));
});

app.get('/logout', (req, res) => {
  console.log("> " + "Logging out...");

  fs.unlink("./cookies.json", () => {
    res.redirect('/');
  });

});

const dobValidator = dob => {
  if (dob.length !== 10) return false;
  if (dob.charAt(2) !== "-" || dob.charAt(5) !== "-") return false;

  return true;
}

app.get("/api", (req, res, next) => {
  let error = new Error("Page is under Construction");
  error.statusCode = 404;
  next(error);
})

app.route("/api/:id")
  .get((req, res) => {
    let code = req.params.id;
    let dob = req.query.dob;

    if (!dob) {
      return res.json({
        "error": {
          "code": 0001,
          "message": "Date of Birth was not provided in the Request. Made a GET Request with proper Params and Query. e.g., GET:api/01C0509E?dob=23-04-1979"
        }
      })
    }
    var dobValidated = dobValidator(dob);
    if (!dobValidated) {
      return res.json({
        "error": {
          "code": 0002,
          "message": "dob format is not validated. Proper Format : (DD-MM-YYYY) e.g., GET:api/01C0509E?dob=23-04-1979"
        }
      })

    }

    dob = dob.replaceAll("-", "/");

    // api/01C0509E?dob=23-04-1979&code=1013649&pass=6268&forceLogin=true
    scrap.download(code, dob).then((data) => {
      if (data.invalidDetails) {
        return res.json({
          "error": {
            "code": 0003,
            "message": "Either Code or DOB is not validated."
          }
        })
      } else {
        res.download(path.join(__dirname, 'public/' + data.fileName));
        console.log("> " + "File Sent to User");
        console.log("\n");
      }


    }).catch((error) => {
      if (!error.loggedIn) {

        fs.unlink("./cookies.json", () => {
          console.log("> " + "Removing Old Sessions");
        });
        login("1013649", "6268").then((result) => {
          if (result.loggedIn) {
            // USER HAS LOGGED IN AGAIN REPEAT THE PROPCESS
            scrap.download(code, dob).then((data) => {
              if (data.invalidDetails) {
                return res.json({
                  "error": {
                    "code": 0003,
                    "message": "Either Code or DOB is not validated."
                  }
                })
              } else {
                res.download(path.join(__dirname, 'public/' + data.fileName));
                console.log("> " + "File Sent to User");
                console.log("\n");
              }


            }).catch((error) => {
              return res.json({
                "error": {
                  "code": 0005,
                  "message": error
                }
              })
            })

            // USER HAS LOGGED IN AGAIN REPEAT THE PROPCESS


          } else {
            return res.json({
              "error": {
                "code": 0004,
                "message": "Error while logging in."
              }
            })
          }
        })


      }
    });

  })

app.use(pageNotFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("> " + "Listening to port " + port);
});
