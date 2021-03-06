const express = require('express');
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
process.env.NODE_ENV == "production" ? null : require('dotenv').config();

const app = express();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.NODE_ENV == "development" ? process.env.DEVPORT : process.env.PORT;

const transporter = nodemailer.createTransport({
    service : process.env.EMAIL_SERVICE,
    auth : {
        user : process.env.EMAIL_ADDRESS,
        pass : process.env.EMAIL_PASSWORD
    }
});

app.get("/",(req, res) => {
    res.send("Welcome to Vacuum server");
    res.end();
});

app.post("/api/sendmail", (req, res) => {

    var response = {
        responseCode : res.statusCode,
        message : "Email sent successfully"
    }

    if((!req.body["sendername"] || !req.body["to"] || !req.body["subject"]) || (!req.body["text"] && !req.body["html"])){
        res.statusCode = 400;
        response.responseCode = res.statusCode;
        response.message = "sendername, to, subject and text or html is required for sending message"
        res.end(JSON.stringify(response));
        return;
    }

    var mailOptions = {
        from: ""+req.body.sendername+" <"+process.env.EMAIL_ADDRESS+">",
        to: req.body.to,
        subject: req.body.subject 
    };

    if(req.body["text"]){
        mailOptions["text"] = req.body.text
    }else{
        mailOptions["html"] = req.body.html
    }

    if(req.body["cc"]){
        mailOptions["cc"] = req.body.cc
    }

    transporter.sendMail(mailOptions,(error,info) => {
        if(error){
            res.statusCode = 401;
            res.send(error);
            res.end();
            return;
        }else{
            res.send(JSON.stringify(response));
            res.end();
            return;
        }
    })
})

app.listen(port,()=>{
    console.log("Server listening at the port " + port);
})