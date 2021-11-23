"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const logger_1 = require("../../logger");
const url = "//localhost:4200/verify";
class Mailer {
    transporter;
    constructor(config) {
        this.transporter = undefined;
        if (!config) {
            nodemailer_1.default.createTestAccount((err, account) => {
                if (err) {
                    logger_1.mainLogger.error('Failed to create a testing account for mailer');
                    logger_1.mainLogger.error(err);
                    return process.exit(1);
                }
                this.transporter = nodemailer_1.default.createTransport({
                    host: account.smtp.host,
                    port: account.smtp.port,
                    secure: account.smtp.secure,
                    auth: {
                        user: account.user,
                        pass: account.pass
                    },
                    logger: false,
                    debug: false
                }, {
                    from: 'Diga Systems <noreply@digasystems.com>',
                });
            });
        }
        else {
            this.transporter = nodemailer_1.default.createTransport(config);
        }
        Object.freeze(this.transporter);
        logger_1.mainLogger.info("Nodemailer initialized...");
    }
    static getInstance() {
        if (!exports.mailer) {
            logger_1.mainLogger.error("MAILER NOT FOUND!");
        }
        return exports.mailer;
    }
    static async initialize(config) {
        exports.mailer = new Mailer(config);
    }
    async sendEmail(emailAddress, emailSubject, emailTemplate, emailData) {
        const data = await ejs_1.default.renderFile(__dirname + `/templates/${emailTemplate}.ejs`, { ...emailData, url });
        try {
            let mailOptions = {
                subject: emailSubject,
                to: emailAddress,
                from: '<noreply@digasystems.com>',
                html: data,
            };
            return this.transporter?.sendMail(mailOptions, (error, info) => {
                if (error)
                    logger_1.mainLogger.info(error + "\n");
                else {
                    logger_1.mainLogger.info("An Email has been sent to " + emailAddress);
                    logger_1.mainLogger.info(nodemailer_1.default.getTestMessageUrl(info));
                }
            });
        }
        catch (error) {
            logger_1.mainLogger.info("Could not send email: " + error);
        }
    }
}
exports.default = Mailer;
