const nodemailer = require('nodemailer');
const path = require("path");
const fs = require("fs");

class Email{

    async send(data){  
        try { 
            //587 false
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: "sipswitchsistema@gmail.com",
                    pass: "mudar123"
                }
            })
            let msg = {
                from: "sipswitchsistema@gmail.com",
                to:data.to,
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


