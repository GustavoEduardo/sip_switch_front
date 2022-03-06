const EmailService = require("./EmailService") 
  
    async function recuperarSenha(data ={}){
        let mail = new EmailService()
        const template = mail.template("recuperarSenha.html", data.replaces)
        const subject = "Redefina sua senha do app Sip Switch"
        
        return await mail.send({
            to: data.email,
            message: {
                subject: subject,
                body: String(template)
            }
        })
        
    } 

module.exports = {recuperarSenha};