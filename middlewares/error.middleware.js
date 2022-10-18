const pageNotFound = (req, res,next) => {
    let err = new Error("Page not Found");
    err.statusCode = 404;
    next(err);
};

const errorHandler =  (error, req, res, next) => {
    if(error.statusCode === 200) error.statusCode = 500;
    console.error(error.stack)
    res.status(500).render('error', {
        statusCode: error.statusCode,
        message : error.message,
        layout: false
    })
};


module.exports = {
    pageNotFound,
    errorHandler
}