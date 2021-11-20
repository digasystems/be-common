import nodemailer, { Transporter } from "nodemailer"
import ejs from "ejs";
import { mainLogger } from "../../logger";

const url = "//localhost:4200/verify";

export var mailer: Mailer;
export default class Mailer {
    transporter: undefined | Transporter;

    constructor(config: any) {
        this.transporter = undefined;
        if (!config) {
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    mainLogger.error('Failed to create a testing account for mailer');
                    mainLogger.error(err)
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
        mainLogger.info("Nodemailer initialized...")
    }

    static getInstance() {
        if (!mailer) {
            mainLogger.error("MAILER NOT FOUND!")
        }
        return mailer;
    }

    static async initialize(config?: any) {
        mailer = new Mailer(config);
    }

    async sendEmail(emailAddress: string, emailSubject: string, emailTemplate: string, emailData: Object) {
        const data = await ejs.renderFile(__dirname + `/templates/${emailTemplate}.ejs`, { ...emailData, url });
        try {
            let mailOptions = {
                subject: emailSubject,
                to: emailAddress,
                from: '<noreply@digasystems.com>',
                html: data,
            };

            return this.transporter?.sendMail(mailOptions, (error, info) => {
                if (error) mainLogger.info(error + "\n");
                else {
                    mainLogger.info("An Email has been sent to " + emailAddress);
                    mainLogger.info(nodemailer.getTestMessageUrl(info));
                }
            })
        } catch (error) {
            mainLogger.info("Could not send email: " + error);
        }
    }
}
