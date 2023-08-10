class EmailTemplates{
    constructor(){} 
    otpVerification(data){
        return `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 10px 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d62333;">Your OTP is ${data.otp}</h2>
        <p style="color: #333;">Use this OTP to verify your account and reset your password within the next 15 minutes. Do not share this OTP with anyone. If it exceeds 15 minutes, request for a new OTP.</p>
        </div>`;
    }
    passwordResetSuccessTemplate(data){
        return `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 10px 20px; max-width: 600px; margin: 0 auto;">
        <h3 style="color: #d62333;">NOTICE!!!</h3>
        <p style="color: #333;">Your password was reset on the Kingdom Television Network platform. If you didn't do this, kindly contact admin on support@kingdom24.tv.</p>
        </div>`;
    }
    adminAccountNotification(data){
        return `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 10px 20px; max-width: 600px; margin: 0 auto;">
        <h3 style="color: #d62333;">Welcome to Kindom Television Network!!!</h3>
        <p style="color: #333;">Your account on Kingdom Television Network administrative platform has been created. Below are your account credentials</p>
        <h4 style="color: #d62333;">Keep those details confidential and make sure you change your password on first login.</h4>
        <table>
            <tr>
                <td>Username/Email</td>
                <td>${data.email}</td>
            </tr>
            <tr>
                <td>Password</td>
                <td>${data.password}</td>
            </tr>
        </table>
        </div>`;
    }
    publicUserSignup(data){
        return `<div style="background-color: #f6f6f6; font-family: Arial, sans-serif;">
    
        <table style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff;">
          <tr>
              <tr>
                  <td style="display:flex; flex-direction: column; align-items:center">
                       <img src="https://kingdom24.tv/assets/icons/logo-knt-gold.png" style="display: block; max-width: 100%; margin-bottom: 20px;">
                  </td>
              </tr>
            <td>
              <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">Thank you for signing up!</h1>
              <p style="font-size: 16px; line-height: 1.5;">Dear ${data.name},</p>
              <br />
              <p style="font-size: 16px; line-height: 1.5;">Thank you for signing up for Kingdom Television Network. Your account has been created and is ready to use.</p>
              <br />
              <p style="font-size: 16px; line-height: 1.5;">To get started, simply log in to your account using your email address and the password you chose during signup.</p>
              <br />
              <p style="font-size: 16px; line-height: 1.5;">If you have any questions or need assistance, please do not hesitate to contact our support team.</p>
              <p style="font-size: 16px; line-height: 1.5;">God bless you.</p>
            </td>
          </tr>
          <tr>
        <td style="display: flex; flex-direction:column; align-items: center;">
          <hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">
          <h2 style="font-size: 20px; margin-bottom: 20px;">Begin with a partnership:</h2>
          
          <a href="https://kingdom24.tv/partnerships" target="_blank" style="display: block; font-size: 16px; text-decoration: none; color: #fff; background-color: #008CBA; padding: 10px 20px; border-radius: 5px; text-align: center; margin-top: 20px; max-width: 200px;">Explore</a>
        </td>
      </tr>
        </table>
      </div>`;
    }
}

module.exports = EmailTemplates;