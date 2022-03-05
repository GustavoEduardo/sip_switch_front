const nodemailer = require('nodemailer');
const path = require("path");
const fs = require("fs");

class Email{

    async send(data){
        if(!data.email) data.email = "gustavolimaeduardo@gmail.com"
        try { 
            //587 false
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: "gustavolimaeduardodev@gmail.com",
                    pass: ""
                }
            })
            let msg = {
                from: "gustavolimaeduardodev@gmail.com",
                to:data.email,
                subject: data.message.subject,
                text: data.message.body.replace(/(<([^>]+)>)/ig, ""),
                html: data.message.body                
            }
            transporter.sendMail(msg)
            console.log("Enviando email")            
            return true

        } catch(error) {
            console.error("MAIL ERROR => ", error)
            return false
        }
    }

    template (filename, replaces =""){
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

    

module.exports = Email;


