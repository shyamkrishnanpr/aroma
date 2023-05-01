const nodemailer  = require('nodemailer');

module.exports={
    mailTransporter:nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
         user: 'projectshyam3@gmail.com',
         pass: 'urpniaymrgzsyrkw',
        },
       }),
}