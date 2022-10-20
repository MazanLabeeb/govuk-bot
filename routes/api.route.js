const express = require("express");
const { dobValidator } = require("../utils/dobValidator");
const router = express.Router();
const scrap = require("./../scrap");



// @  ACCESS: PUBLIC
// @  METHOD: GET 
// @  API


const getApi = router.get("/:id", (req, res) => {
    let code = req.params.id;
    let dob = req.query.dob;
    let company = req.query.company;

    if (!dob) {
        return res.status(500).json({
            "message": "Date of Birth was not provided in the Request. Made a GET Request with proper Params and Query. e.g., GET:api/WJ6AWKZGY?dob=03-03-1988&company=Nightingale%20Pass"
            
        })
    }
    var dobValidated = dobValidator(dob);
    if (!dobValidated) {
        return res.status(500).json({
            "message":"dob format is not validated. Proper Format : (DD-MM-YYYY) e.g., GET:api/WJ6AWKZGY?dob=03-03-1988&company=Nightingale%20Pass"
            
        })

    }



    dob = dob.replaceAll("-", "/");

    if (!company) {
        return res.status(500).json({
                "message": "Company name is missing. e.g., GET:api/WJ6AWKZGY?dob=03-03-1988&company=Nightingale%20Pass"
        })
    }

    scrap.download(code, dob, company).then(() => {

        res.download(req.app.get('fileName'));
        console.log("> " + "File Sent through API");

    }).catch(({ error }) => {
        error += ". Make sure you have requested with valid details. Check logs or contact API developer for further details";
        res.status(500).json({"message":error});
    });
});

module.exports = {
    getApi
}