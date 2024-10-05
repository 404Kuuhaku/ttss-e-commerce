import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: Number(process.env.EMAIL_PORT),
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.EMAIL_USER, 
		pass: process.env.EMAIL_PASS, 
	},
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to,
		subject,
		text,
        html,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Email sent to ${to}`);
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
}
