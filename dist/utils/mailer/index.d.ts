import { Transporter } from "nodemailer";
export declare var mailer: Mailer;
export default class Mailer {
    transporter: undefined | Transporter;
    constructor(config: any);
    static getInstance(): Mailer;
    static initialize(config?: any): Promise<void>;
    sendEmail(emailAddress: string, emailSubject: string, emailTemplate: string, emailData: Object): Promise<any>;
}
