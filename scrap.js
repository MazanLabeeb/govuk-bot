const puppeteer = require("puppeteer");
const path = require('path');
const { sleep } = require("./utils/sleep.utils");
const downloadLocation = path.join(__dirname, "public");
require('dotenv').config();



module.exports.download = (code = "", date = "", company = "") => new Promise(async (resolve, reject) => {
  code = code.trim();
  date = date.trim();
  company = company.trim();



  console.log(">", `Scraper started | Received Code => ${code}, DOB => ${date}, Company => ${company}`);


  if (date.split("/").length != 3) {
    console.log("Invalid Date");
    return reject({ error : "Invalid DOB"});
  }



  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === 'development'? false: true,
  });
  const page = await browser.newPage();



  // change default download location for pupeteer
  const client = await page.target().createCDPSession()
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadLocation,
  })


  await page.goto("https://right-to-work.service.gov.uk/rtw-view/profile");

  // entering share code
  try {
    await page.type("#shareCode", code);
    console.log("> " + "Entering Share Code");
  } catch (e) {
    await browser.close();
    var error = "Error while entering share code";
    console.log("> " + error);
    return reject({ error })
  }

  // submitting the share code
  try {
    await page.waitForSelector("#submit");
    await page.click("#submit");

    console.log("> " + "Share Code Submitted");

  } catch (e) {
    await browser.close();
    var error = "Error while clicking share code submit button";
    console.log("> " + error);
    return reject({ error })
  }


  // entering the dob
  try {
    console.log("> " + "Typing the DOB");
    await page.waitForSelector("#dob-day");

    await page.type("#dob-day", date.split("/")[0]);
    await page.type("#dob-month", date.split("/")[1]);
    await page.type("#dob-year", date.split("/")[2]);
  } catch (error) {
    await browser.close();
    var error = "Error while typing the DOB";
    console.log("> " + error);
    return reject({error})

  }

  // submitting the dob
  try {
    await page.waitForSelector("#submit");
    await page.click("#submit");

    console.log("> " + "DOB Submitted");

  } catch (e) {
    await browser.close();
    var error = "Error while submitting DOB";
    console.log("> " + error);
    return reject({error})
  }

  // Clicking Start Now
  try {
    await page.waitForSelector("#get-started > a");
    await page.click("#get-started > a");

    console.log("> " + "Start Now button Clicked");

  } catch (e) {
    await browser.close();
    var error =  "Error while clicking the Start Now button after submitting credentials(code, dob, company) ";
    console.log("> " + error);
    return reject({error})
  }


  // typing the company name

  try {
    console.log("> " + "Typing the Company Name");
    await page.waitForSelector("#checkerName");

    await page.type("#checkerName", company);
  } catch (error) {
    await browser.close();
    var error =  "Error while typing Company name";
    console.log("> " + error);
    return reject({error})

  }

  // submitting the company name  
  try {
    await page.waitForSelector("#content > div > form > input.button");
    await page.click("#content > div > form > input.button");

    console.log("> " + "Company name submitted");

  } catch (e) {
    await browser.close();
    var error = "Error while submitting the Company name";
    console.log("> " + error);
    return reject({error})
  }

  // download the file  
  try {
    await page.waitForSelector("#content > div > form > div > div.column-full.no-padding > div:nth-child(2) > input");
    await page.click("#content > div > form > div > div.column-full.no-padding > div:nth-child(2) > input");

    console.log("> " + "Download pdf Clicked");

  } catch (e) {
    await browser.close();
    var error = "Error while clicking the Download pdf button";
    console.log("> " + error);
    return reject({error})
  }

  console.log("> " + "Downloading file...");
  await sleep(5000);
  console.log("> " + "File Downloaded.");
  let message = "File downlaoded"
  resolve({message})


  await browser.close();
});
