const nodemailer= require('nodemailer');
const path = require("path");
const fs = require("fs");

class EmailService{

    async send({to, message, bcc}){
        try { 
            //587 false
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: "gustavolimaeduardodev@gmail.com",
                    pass: "@choqueE123"
                }
            }) 
            let response = transporter.sendMail({
                from: "gustavolimaeduardodev@gmail.com",
                to:"gustavolimaeduardo@gmail.com",
                subject: message.subject,
                text: message.body.replace(/(<([^>]+)>)/ig, ""),
                html: message.body                
            })
            console.log("Enviando email")            
            return true

        } catch(error) {
            console.error("MAIL ERROR => ", error)
            return false
        }
    }

    template(filename, replaces =""){
        try {

            let pathname = path.resolve(__dirname, `templates/${filename}`)
            let html = fs.readFileSync(pathname, "utf8")

            for(const [key, value] of Object.entries(replaces) ) {
                html = html.split(`{{${key}}}`).join(String(value))
            }
            return html

        } catch(error) {
            console.log("MAIL TEMPLATE ERROR => ", error)
            return false
        }
    }

}

module.exports = EmailService;


