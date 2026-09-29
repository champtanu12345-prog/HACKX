import smtplib
import re
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

from backend.core.config import settings


def send_real_email_otp(to_email: str, otp: str, name: str = "Officer") -> Dict[str, Any]:
    """
    Deliver a real security OTP to the user's Gmail / Email inbox via SMTP.
    If SMTP credentials are set in .env, it dispatches the actual email.
    Otherwise, returns fallback simulation with instructions.
    """
    clean_email = to_email.strip().lower()

    # If SMTP is configured in .env, send real email!
    if settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"HACKX-ICG Verification OTP: {otp}"
            msg["From"] = settings.SMTP_FROM_EMAIL or f"HACKX Maritime Intelligence <{settings.SMTP_USER}>"
            msg["To"] = clean_email

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>HACKX ICG Verification</title>
            </head>
            <body style="margin:0;padding:0;background-color:#02180D;font-family:Arial,sans-serif;color:#111827;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#02180D;padding:30px 10px;">
                <tr>
                  <td align="center">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:2px solid #D4AF37;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
                      <!-- Tricolor Accent Bar -->
                      <tr>
                        <td height="6" style="background:linear-gradient(to right, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%);"></td>
                      </tr>
                      <!-- Header -->
                      <tr>
                        <td style="background:#032B13;padding:24px;text-align:center;color:#ffffff;">
                          <h2 style="margin:0;font-size:20px;letter-spacing:1px;color:#FFD700;">भारतीय तटरक्षक // INDIAN COAST GUARD</h2>
                          <p style="margin:6px 0 0 0;font-size:12px;color:#A7F3D0;font-family:monospace;">HACKX Autonomous Maritime Oil Spill Intelligence & Legal Attribution System</p>
                        </td>
                      </tr>
                      <!-- Body -->
                      <tr>
                        <td style="padding:32px 28px;background:#ffffff;">
                          <h3 style="margin:0 0 12px 0;color:#064E26;font-size:17px;">Jai Hind, {name}</h3>
                          <p style="margin:0 0 20px 0;font-size:13px;color:#374151;line-height:1.6;">
                            You have initiated a secure login to the <strong>HACKX National Maritime Intelligence Workstation</strong>.
                            Please use the following single-use One-Time Password (OTP) to authorize your access:
                          </p>
                          <!-- OTP Box -->
                          <div style="background:#ECFDF5;border:2px dashed #059669;border-radius:8px;padding:18px;text-align:center;margin:25px 0;">
                            <span style="font-family:monospace;font-size:32px;font-weight:bold;letter-spacing:8px;color:#064E26;">{otp}</span>
                            <div style="margin-top:8px;font-size:11px;color:#047857;">Valid for 5 minutes. Do not share this code.</div>
                          </div>
                          <p style="margin:0 0 10px 0;font-size:12px;color:#6B7280;line-height:1.5;">
                            If you did not request this verification, please alert the MRCC Cyber Security Watchstander immediately.
                          </p>
                          <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0 16px 0;" />
                          <p style="margin:0;font-size:11px;color:#9CA3AF;text-align:center;font-family:monospace;">
                            "वयं रक्षामः // WE PROTECT" · Ministry of Defence · Smart India Hackathon 2026 (SIH 260143)
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """
            text_content = (
                f"Jai Hind, {name}.\n\n"
                f"Your HACKX Indian Coast Guard Verification OTP is: {otp}\n\n"
                f"This code is valid for 5 minutes. Do not share this code with anyone.\n\n"
                f"Ministry of Defence | Smart India Hackathon 2026"
            )
            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            if settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=15)
            else:
                server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=15)
                if settings.SMTP_USE_TLS:
                    server.starttls()

            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(msg["From"], [clean_email], msg.as_string())
            server.quit()

            return {
                "delivered": True,
                "method": "REAL_SMTP",
                "recipient": clean_email,
                "message": f"Real OTP successfully dispatched to your Gmail inbox: {clean_email}",
            }
        except Exception as e:
            return {
                "delivered": False,
                "method": "SMTP_ERROR",
                "recipient": clean_email,
                "error": str(e),
                "message": f"SMTP delivery encountered an error: {str(e)}. Fallback OTP available.",
            }

    # If SMTP is not yet configured, return informative status
    return {
        "delivered": False,
        "method": "SIMULATED",
        "recipient": clean_email,
        "message": f"OTP generated for {clean_email}. To receive real emails in your Gmail inbox, configure SMTP_USER and SMTP_PASSWORD in .env.",
    }


def send_real_sms_otp(to_phone: str, otp: str) -> Dict[str, Any]:
    """
    Deliver a real security SMS OTP to the user's mobile phone (+91).
    Supports Fast2SMS (Indian SMS Gateway) or Twilio if configured in .env.
    """
    phone_digits = re.sub(r"\D", "", to_phone)

    # 1. Fast2SMS Indian Gateway Integration
    if settings.FAST2SMS_API_KEY and len(phone_digits) >= 10:
        ten_digit_phone = phone_digits[-10:]
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            payload = {
                "variables_values": otp,
                "route": "otp",
                "numbers": ten_digit_phone,
            }
            headers = {
                "authorization": settings.FAST2SMS_API_KEY,
                "Content-Type": "application/x-www-form-urlencoded",
            }
            res = requests.post(url, data=payload, headers=headers, timeout=10)
            data = res.json()
            if data.get("return"):
                return {
                    "delivered": True,
                    "method": "FAST2SMS",
                    "recipient": f"+91{ten_digit_phone}",
                    "message": f"Real SMS OTP dispatched to +91{ten_digit_phone} via Fast2SMS gateway.",
                    "gateway_data": data,
                }
            else:
                return {
                    "delivered": False,
                    "method": "FAST2SMS_ERROR",
                    "recipient": f"+91{ten_digit_phone}",
                    "error": data.get("message", "Fast2SMS rejected dispatch"),
                }
        except Exception as e:
            return {
                "delivered": False,
                "method": "FAST2SMS_EXCEPTION",
                "recipient": f"+91{ten_digit_phone}",
                "error": str(e),
            }

    # 2. Twilio Gateway Integration
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_PHONE:
        try:
            formatted_phone = f"+{phone_digits}" if not to_phone.startswith("+") else to_phone
            twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
            res = requests.post(
                twilio_url,
                data={
                    "From": settings.TWILIO_FROM_PHONE,
                    "To": formatted_phone,
                    "Body": f"HACKX ICG Alert: Your verification OTP is {otp}. Valid for 5 minutes. Do not share. -MRCC Mumbai",
                },
                auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                timeout=10,
            )
            if res.status_code in [200, 201]:
                return {
                    "delivered": True,
                    "method": "TWILIO",
                    "recipient": formatted_phone,
                    "message": f"Real SMS OTP dispatched to {formatted_phone} via Twilio.",
                }
            else:
                return {
                    "delivered": False,
                    "method": "TWILIO_ERROR",
                    "recipient": formatted_phone,
                    "error": res.text,
                }
        except Exception as e:
            return {
                "delivered": False,
                "method": "TWILIO_EXCEPTION",
                "recipient": to_phone,
                "error": str(e),
            }

    # Fallback simulation
    return {
        "delivered": False,
        "method": "SIMULATED",
        "recipient": to_phone,
        "message": f"OTP generated for {to_phone}. To receive real SMS on your mobile phone, set FAST2SMS_API_KEY in .env.",
    }
