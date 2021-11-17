import nodemailer, { Transporter } from "nodemailer"
import ejs from "ejs";
import logger from "../../logger";

export var mailer: Mailer;

export default class Mailer {
    transporter: undefined | Transporter;

    constructor(config: any) {
        this.transporter = undefined;
        if (!config) {
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    logger.error('Failed to create a testing account for mailer');
                    logger.error(err)
                    return process.exit(1);
                }
                this.transporter = nodemailer.createTransport(
                    {
                        host: account.smtp.host,
                        port: account.smtp.port,
                        secure: account.smtp.secure,
                        auth: {
                            user: account.user,
                            pass: account.pass
                        },
                        logger: false,
                        debug: false // include SMTP traffic in the logs
                    },
                    {
                        from: 'Diga Systems <noreply@digasystems.com>',
                    }
                );
            });
        } else {
            this.transporter = nodemailer.createTransport(config);
        }
        Object.freeze(this.transporter);
        logger.info("Nodemailer initialized...")
    }

    static getInstance() {
        if (!mailer) {
            logger.error("MAILER NOT FOUND!")
        }
        return mailer;
    }

    static async initialize(config?: any) {
        mailer = new Mailer(config);
    }

    async sendEmail(emailAddress: string, emailSubject: string, emailTemplate: string, emailData: Object) {
        const data = await ejs.renderFile(__dirname + `/templates/${emailTemplate}.ejs`, emailData);
        try {
            let mailOptions = {
                subject: emailSubject,
                to: emailAddress,
                from: '<noreply@digasystems.com>',
                html: data,
            };

            return this.transporter?.sendMail(mailOptions, (error, info) => {
                if (error) logger.info(error + "\n");
                else {
                    logger.info("An Email has been sent to " + emailAddress);
                    logger.info(nodemailer.getTestMessageUrl(info));
                }
            })
        } catch (error) {
            logger.info("Could not send email: " + error);
        }
    }
}
