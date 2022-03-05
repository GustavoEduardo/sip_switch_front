const EmailService = require("./EmailService")
 
  
    async function recuperarSenha(data ={}){

        const mail = new EmailService()
        const template = mail.template("recuperarSenha.html", data.replaces)
        const subject = "Redefina sua senha do app Facinnius"
        
        return await mail.send({
            to: {
                email: data.email
            },
            message: {
                subject: subject,
                body: String(template)
            }
        })
        
    } 

module.exports = recuperarSenha();