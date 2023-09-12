const crypto = require('crypto')
const nodemailer = require("nodemailer");

class OTPServices {
    async generateOTP(digits) {
        const lb = Number('1' + '0'.repeat(digits - 1))
        const ub = Number('9'.repeat(digits))
        return crypto.randomInt(lb, ub)
    }
    // async sendBySMS(phone, OTP) {}
    async sendByEmail(email, OTP) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
        const info = await transporter.sendMail({
            from: `${process.env.SMTP_NAME} <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Verification OTP",
            html: `<p>Verification OTP for your account: <b>${OTP}</b></p>`,
        });
    }

    verifyOTP() { }

}

module.exports = new OTPServices();