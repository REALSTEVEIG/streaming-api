const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");

module.exports = (express, container) => {
  const conn = require("./../../database/config/config");

  const router = express.Router();
  router.get("/nodemailer/:token", async (req, res, next) => {
    const decodedParams = Buffer.from(req.params.token, "base64").toString("utf-8");
    const paramsObject = JSON.parse(decodedParams);

    const user_id = paramsObject.user_id;

    const db = conn.client.db(conn.config.dbName).collection("users");

    // console.log(paramsObject);
    // console.log("user_id: " + user_id);

    try {
      // Convert user_id to ObjectId
      const objectId = new ObjectId(user_id);

      // Retrieve the user object from the database using the ObjectId
      const user = await db.findOne({ _id: objectId });

      if (user) {
        console.log("email:", user.email);


        let transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user: "kingdomtv@onoriocutane.org",
                pass: "phogtpbfbxzvrhww",
            }
        })

        const mailOptions = {
          from: "hczwipinogeduvcn",
          to: user.email,
          subject: "Payment Confirmation",
          html: `
            <div style="background-color: #f6f6f6; font-family: Arial, sans-serif;">
              <table style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff;">
                <tr>
                  <tr>
                    <td style="display:flex; flex-direction: column; align-items:center">
                      <img src="https://kingdom24.tv/assets/icons/logo-knt-gold.png" style="display: block; max-width: 100%; margin-bottom: 20px;">
                    </td>
                  </tr>
                  <td>
                    <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">Payment Received!</h1>
                    <p style="font-size: 16px; line-height: 1.5;">Dear ${user.first_name} ${user.last_name},</p>
                    <br />
                    <p style="font-size: 16px; line-height: 1.5;">Thank you for partnering with Kingdom Television Network. We have received your payment.</p>
                    <br />
                    <p style="font-size: 16px; line-height: 1.5;">To continue, simply log in to your account using your email address and the password you chose during signup.</p>
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
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });
      } else {
        console.log("User not found.");
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
    }

    res.end();
  });

  return router;
};
