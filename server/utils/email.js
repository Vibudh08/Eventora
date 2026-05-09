import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @ts-ignore
export const sendOTPEmail = async (email, otp, type) => {
  try {
    let subject = "";
    let heading = "";
    let message = "";

    if (type === "account_verification") {
      subject = "Verify Your Eventora Account";
      heading = "Account Verification";
      message =
        "Use the OTP below to verify your Eventora account. This OTP is valid for 5 minutes.";
    }

    if (type === "event_booking") {
      subject = "Confirm Your Event Booking";
      heading = "Event Booking OTP";
      message =
        "Use the OTP below to confirm your event booking. This OTP is valid for 5 minutes.";
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            
            <div style="background: #111827; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">Eventora</h1>
            </div>

            <div style="padding: 30px; text-align: center;">
              <h2 style="margin-bottom: 10px; color: #111827;">
                ${heading}
              </h2>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
                ${message}
              </p>

              <div style="margin: 30px 0;">
                <span style="
                  display: inline-block;
                  background: #111827;
                  color: #ffffff;
                  padding: 14px 30px;
                  font-size: 32px;
                  letter-spacing: 8px;
                  border-radius: 10px;
                  font-weight: bold;
                ">
                  ${otp}
                </span>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
              © ${new Date().getFullYear()} Eventora
            </div>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

// @ts-ignore
export const sendEventStatusEmail = async (email, eventName, type) => {
  try {
    let subject = "";
    let heading = "";
    let message = "";

    if (type === "booking_success") {
      subject = "Event Booking Confirmed";
      heading = "Booking Confirmed";
      message = `Your booking for "${eventName}" has been confirmed successfully.`;
    }

    if (type === "booking_cancelled") {
      subject = "Event Booking Cancelled";
      heading = "Booking Cancelled";
      message = `Your booking for "${eventName}" has been cancelled successfully.`;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            
            <div style="background: #111827; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">Eventora</h1>
            </div>

            <div style="padding: 30px; text-align: center;">
              <h2 style="margin-bottom: 10px; color: #111827;">
                ${heading}
              </h2>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
                ${message}
              </p>
            </div>

            <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
              © ${new Date().getFullYear()} Eventora
            </div>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
