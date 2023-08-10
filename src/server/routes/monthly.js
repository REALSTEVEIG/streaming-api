const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");

module.exports = (express, container) => {
    const conn = require("./../../database/config/config");
    const router = express.Router();

    // Nodemailer configuration
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "kingdomtv@onoriocutane.org",
            pass: "phogtpbfbxzvrhww",
        }
    });

    router.get("/mail_partnerships", async (req, res, next) => {
        const db = conn.client.db(conn.config.dbName).collection("cart_items");
        const result = await db.find({ partnership_id: { $ne: null } }).toArray();
        const total_subscribers = result.length;

        const all_partnerships_id = result.map(e => e.created_by);

        const db2 = conn.client.db(conn.config.dbName).collection("users");

        const x = all_partnerships_id.map(e => ObjectId(e));

        const result2 = await db2.find({ _id: { $in: x } }).toArray();

        const allParnershipEmails = result2.map(e => e.email);
        const firstNames = result2.map(e => e.first_name);

        // Sending reminder emails
        allParnershipEmails.forEach(async (email, index) => {
            const mailOptions = {
                from: "kingdomtv@onoriocutane.org", // Sender's email address
                to: email, // Receiver's email address
                subject: "Monthly Partnership Payment Reminder", // Email subject
                html: `
                    <div style="background-color: #f6f6f6; font-family: Arial, sans-serif;">
                        <table style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff;">
                            <tr>
                                <td style="display:flex; flex-direction: column; align-items:center">
                                    <img src="https://kingdom24.tv/assets/icons/logo-knt-gold.png" style="display: block; max-width: 100%; margin-bottom: 20px;">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">Kingdom Television Partnerships!</h1>
                                    <p style="font-size: 16px; line-height: 1.5;">Dear ${firstNames[index]},</p>
                                    <br />
                                    <p style="font-size: 16px; line-height: 1.5;">This is a friendly reminder to make your monthly partnership payment. We value your support and appreciate your contributions.</p>
                                    <br />
                                    <p style="font-size: 16px; line-height: 1.5;">To continue enjoying the benefits of our partnership program, kindly make your payment by the due date.</p>
                                    <br />
                                    <p style="font-size: 16px; line-height: 1.5;">If you have any questions or need assistance, please do not hesitate to contact our support team.</p>
                                    <p style="font-size: 16px; line-height: 1.5;">God bless you.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="display: flex; flex-direction:column; align-items: center;">
                                    <hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">
                                    <a href="https://kingdom24.tv/partnerships" target="_blank" style="display: block; font-size: 16px; text-decoration: none; color: #fff; background-color: #008CBA; padding: 10px 20px; border-radius: 5px; text-align: center; margin-top: 20px; max-width: 200px;">Explore Partnerships</a>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            };

            // Send the email
            try {
                const info = await transporter.sendMail(mailOptions);
                console.log("Email sent:", info.response);
            } catch (error) {
                console.log("Error sending email:", error);
            }
        });

        res.json({
            total: total_subscribers,
            result
        });
    });

    return router;
};
