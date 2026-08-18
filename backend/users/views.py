import random
import urllib.request
import urllib.parse
import json
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from .serializers import UserSerializer, RegisterSerializer
from .models import OTPVerification, EmailOTPVerification

User = get_user_model()



def send_real_sms_otp(phone_number, otp_code):
    """
    Sends real SMS via Fast2SMS, 2Factor, or Twilio if API keys are configured in settings.py or environment.
    Falls back gracefully if no gateway key is provided.
    """
    clean_number = "".join(filter(str.isdigit, str(phone_number)))
    if len(clean_number) > 10 and clean_number.startswith("91"):
        clean_number = clean_number[2:]

    fast2sms_key = getattr(settings, 'FAST2SMS_API_KEY', os.getenv('FAST2SMS_API_KEY', ''))
    twofactor_key = getattr(settings, 'TWOFACTOR_API_KEY', os.getenv('TWOFACTOR_API_KEY', ''))
    twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', os.getenv('TWILIO_ACCOUNT_SID', ''))
    twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', os.getenv('TWILIO_AUTH_TOKEN', ''))
    twilio_from = getattr(settings, 'TWILIO_PHONE_NUMBER', os.getenv('TWILIO_PHONE_NUMBER', ''))

    sms_sent = False
    provider_msg = ""

    # 1. Fast2SMS (Indian +91 Mobile Numbers)
    if fast2sms_key:
        try:
            url = f"https://www.fast2sms.com/dev/bulkV2?authorization={fast2sms_key}&route=otp&variables_values={otp_code}&flash=0&numbers={clean_number}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                res_data = json.loads(response.read().decode())
                if res_data.get('return'):
                    sms_sent = True
                    provider_msg = "Real SMS dispatched via Fast2SMS!"
        except Exception as e:
            provider_msg = f"Fast2SMS API error: {str(e)}"

    # 2. 2Factor.in (Indian Instant SMS API)
    elif twofactor_key:
        try:
            url = f"https://2factor.in/API/V1/{twofactor_key}/SMS/{clean_number}/{otp_code}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                res_data = json.loads(response.read().decode())
                if res_data.get('Status') == 'Success':
                    sms_sent = True
                    provider_msg = "Real SMS dispatched via 2Factor!"
        except Exception as e:
            provider_msg = f"2Factor API error: {str(e)}"

    # 3. Twilio (Global SMS Gateway)
    elif twilio_sid and twilio_token and twilio_from:
        try:
            import base64
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
            to_phone = f"+91{clean_number}" if len(clean_number) == 10 else f"+{clean_number}"
            data = urllib.parse.urlencode({
                'To': to_phone,
                'From': twilio_from,
                'Body': f"Your Contrax Verification OTP is {otp_code}. Valid for 10 minutes."
            }).encode('utf-8')
            
            auth_header = base64.b64encode(f"{twilio_sid}:{twilio_token}".encode('utf-8')).decode('utf-8')
            req = urllib.request.Request(url, data=data, headers={
                'Authorization': f'Basic {auth_header}',
                'Content-Type': 'application/x-www-form-urlencoded'
            })
            with urllib.request.urlopen(req, timeout=5) as response:
                sms_sent = True
                provider_msg = "Real SMS dispatched via Twilio!"
        except Exception as e:
            provider_msg = f"Twilio API error: {str(e)}"

    if not sms_sent:
        print(f"\n=======================================================")
        print(f"  [SMS OTP DISPATCH LOG]")
        print(f"  Target Phone: {phone_number} | OTP Code: {otp_code}")
        print(f"  Notice: Live SMS Gateway Key (Fast2SMS / 2Factor / Twilio) not set in backend settings.py")
        print(f"=======================================================\n")

    return sms_sent, provider_msg



def send_smtp_email_otp(email, otp_code):
    """
    Sends verification OTP email via SMTP (Gmail / Custom SMTP).
    First attempts SSL Port 465 (bypassing Windows WinError 10054 socket resets), and falls back to Port 587 TLS.
    """
    email_host = getattr(settings, 'EMAIL_HOST', os.getenv('EMAIL_HOST', 'smtp.gmail.com'))
    email_user = getattr(settings, 'EMAIL_HOST_USER', os.getenv('EMAIL_HOST_USER', '')).strip()
    email_password = getattr(settings, 'EMAIL_HOST_PASSWORD', os.getenv('EMAIL_HOST_PASSWORD', '')).replace(' ', '').strip()

    email_sent = False
    provider_msg = ""

    if email_user and email_password:
        target_email = str(email).strip().lower()
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Contrax Verification Code: {otp_code}"
        msg['From'] = f"Contrax Verification <{email_user}>"
        msg['To'] = target_email

        text_body = (
            f"Hello,\n\n"
            f"Your email verification code for Contrax is: {otp_code}\n\n"
            f"This code will expire in 10 minutes. Enter this code on the signup or login page to verify your account.\n\n"
            f"Best regards,\n"
            f"The Contrax Team"
        )

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 20px; color: #f8fafc;">
          <div style="max-width: 540px; margin: 0 auto; background: #151d30; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            
            <!-- Branded Header with Vector SVG Logo -->
            <div style="background: linear-gradient(135deg, #0b0f19 0%, #151d30 100%); padding: 32px 20px; text-align: center; border-bottom: 2px solid #00f2fe;">
              <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <svg width="42" height="42" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="otpCyanTop" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#00F2FE" />
                          <stop offset="50%" stop-color="#00C6FF" />
                          <stop offset="100%" stop-color="#0072FF" />
                        </linearGradient>
                        <linearGradient id="otpCyanBottom" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#00E5FF" />
                          <stop offset="50%" stop-color="#00A8FF" />
                          <stop offset="100%" stop-color="#0284C7" />
                        </linearGradient>
                      </defs>
                      <path d="M 14 57 L 38 14 L 98 14 L 75 41 L 53 41 L 34 57 Z" fill="url(#otpCyanTop)" />
                      <path d="M 14 63 L 38 106 L 98 106 L 75 79 L 53 79 L 34 63 Z" fill="url(#otpCyanBottom)" />
                    </svg>
                  </td>
                  <td style="vertical-align: middle; text-align: left;">
                    <span style="font-size: 30px; font-weight: 800; color: #ffffff; letter-spacing: -0.8px;">Contra<span style="color: #00f2fe;">x</span></span>
                  </td>
                </tr>
              </table>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px; font-weight: 600; letter-spacing: 0.2px;">Gig-Contracts at the Speed of Ride-Hailing</p>
            </div>

            <!-- Email Body Content -->
            <div style="padding: 32px 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
              <span style="display: inline-block; background: rgba(0, 242, 254, 0.12); border: 1px solid rgba(0, 242, 254, 0.4); color: #00f2fe; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">SECURITY VERIFICATION</span>
              
              <h2 style="color: #f8fafc; margin-top: 0; font-size: 20px; font-weight: 700;">Email Verification Code</h2>
              <p style="color: #94a3b8; margin: 0 0 20px 0;">Use the 6-digit verification code below to complete your authentication on Contrax:</p>
              
              <div style="background: #0b0f19; padding: 22px; border-radius: 12px; text-align: center; margin: 24px 0; border: 1.5px solid #00f2fe; box-shadow: 0 0 20px rgba(0, 242, 254, 0.15);">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #00f2fe; font-family: monospace;">{otp_code}</span>
              </div>

              <p style="color: #64748b; font-size: 13px; margin: 0;">⏱️ This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; background: #0b0f19;">
              &copy; 2026 Contrax Inc. All rights reserved.<br>
              Automated security message sent to {target_email}.
            </div>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        context = ssl._create_unverified_context()

        # 1. Try SSL Port 465 first (bypasses Windows Firewall WinError 10054 STARTTLS resets)
        try:
            with smtplib.SMTP_SSL(email_host, 465, context=context, timeout=12) as server:
                server.login(email_user, email_password)
                server.sendmail(email_user, [target_email], msg.as_string())
            email_sent = True
            provider_msg = f"Live verification email delivered to {target_email} via SMTP (SSL 465)!"
        except Exception as ssl_err:
            # 2. Fallback to TLS Port 587 if SSL fails
            try:
                with smtplib.SMTP(email_host, 587, timeout=12) as server:
                    server.starttls(context=context)
                    server.login(email_user, email_password)
                    server.sendmail(email_user, [target_email], msg.as_string())
                email_sent = True
                provider_msg = f"Live verification email delivered to {target_email} via SMTP (TLS 587)!"
            except Exception as tls_err:
                provider_msg = f"SMTP SSL/TLS error: {str(ssl_err)} | {str(tls_err)}"

        if email_sent:
            print(f"\n=======================================================")
            print(f"  [SMTP EMAIL SUCCESS]")
            print(f"  Target Email: {email} | Sent via: {email_host} ({email_user})")
            print(f"=======================================================\n")
        else:
            print(f"\n=======================================================")
            print(f"  [SMTP EMAIL FAILURE]")
            print(f"  Target Email: {email} | Error: {provider_msg}")
            print(f"=======================================================\n")
    else:
        provider_msg = "SMTP credentials (EMAIL_HOST_USER & EMAIL_HOST_PASSWORD) not set in backend settings.py."

    return email_sent, provider_msg


def send_welcome_email(user):
    """
    Sends a rich HTML welcome email to newly registered users via SMTP.
    Utilizes dual-port SSL 465 / TLS 587 fallback.
    """
    if not user.email:
        return False, "No email address on account"

    email_host = getattr(settings, 'EMAIL_HOST', os.getenv('EMAIL_HOST', 'smtp.gmail.com'))
    email_user = getattr(settings, 'EMAIL_HOST_USER', os.getenv('EMAIL_HOST_USER', '')).strip()
    email_password = getattr(settings, 'EMAIL_HOST_PASSWORD', os.getenv('EMAIL_HOST_PASSWORD', '')).replace(' ', '').strip()

    if not email_user or not email_password:
        return False, "SMTP credentials missing"

    role_title = "Client" if user.role == "client" else ("Contractor" if user.role == "contractor" else "Member")
    role_description = "post gig jobs and hire verified contractors instantly." if user.role == "client" else "find contract opportunities and manage your gig services."

    subject = f"Welcome to Contrax, {user.username}! 🚀"
    
    text_body = (
        f"Hello {user.username},\n\n"
        f"Welcome to Contrax! We're thrilled to have you join our platform as a {role_title}.\n\n"
        f"With your new account, you can {role_description}\n\n"
        f"Account Summary:\n"
        f"- Username: {user.username}\n"
        f"- Email: {user.email}\n"
        f"- Registered Role: {role_title}\n\n"
        f"Best regards,\n"
        f"The Contrax Team\n"
        f"Gig-Contracts at the Speed of Ride-Hailing"
    )

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 20px; color: #f8fafc;">
      <div style="max-width: 560px; margin: 0 auto; background: #151d30; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <!-- Branded Header with Vector SVG Logo -->
        <div style="background: linear-gradient(135deg, #0b0f19 0%, #151d30 100%); padding: 36px 20px; text-align: center; border-bottom: 2px solid #00f2fe;">
          <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle; padding-right: 12px;">
                <svg width="44" height="44" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="welcomeCyanTop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00F2FE" />
                      <stop offset="50%" stop-color="#00C6FF" />
                      <stop offset="100%" stop-color="#0072FF" />
                    </linearGradient>
                    <linearGradient id="welcomeCyanBottom" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00E5FF" />
                      <stop offset="50%" stop-color="#00A8FF" />
                      <stop offset="100%" stop-color="#0284C7" />
                    </linearGradient>
                  </defs>
                  <path d="M 14 57 L 38 14 L 98 14 L 75 41 L 53 41 L 34 57 Z" fill="url(#welcomeCyanTop)" />
                  <path d="M 14 63 L 38 106 L 98 106 L 75 79 L 53 79 L 34 63 Z" fill="url(#welcomeCyanBottom)" />
                </svg>
              </td>
              <td style="vertical-align: middle; text-align: left;">
                <span style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.8px;">Contra<span style="color: #00f2fe;">x</span></span>
              </td>
            </tr>
          </table>
          <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 600; letter-spacing: 0.2px;">Gig-Contracts at the Speed of Ride-Hailing</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
          <span style="display: inline-block; background: rgba(0, 242, 254, 0.12); border: 1px solid rgba(0, 242, 254, 0.4); color: #00f2fe; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">WELCOME ONBOARD</span>
          
          <h2 style="color: #f8fafc; margin-top: 0; font-size: 22px; font-weight: 700;">Welcome to Contrax, {user.username}! 🎉</h2>
          <p style="margin: 0 0 20px 0; color: #cbd5e1;">Your account has been successfully created and verified. You are all set to {role_description}</p>
          
          <!-- Mobile-Responsive Table Card for Account Details -->
          <div style="background: #0b0f19; border-radius: 12px; padding: 18px 20px; margin: 24px 0; border: 1px solid #1e293b;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; font-size: 13px; font-weight: 600; width: 35%; vertical-align: top;">Username:</td>
                <td style="padding: 10px 0; color: #f8fafc; font-size: 14px; font-weight: 700; text-align: right; vertical-align: top; word-break: break-all;">{user.username}</td>
              </tr>
              <tr>
                <td colspan="2" style="border-bottom: 1px solid #1e293b; height: 1px; padding: 0;"></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; font-size: 13px; font-weight: 600; width: 35%; vertical-align: top;">Email Address:</td>
                <td style="padding: 10px 0; color: #38bdf8; font-size: 13px; font-weight: 700; text-align: right; vertical-align: top; word-break: break-all;">{user.email}</td>
              </tr>
              <tr>
                <td colspan="2" style="border-bottom: 1px solid #1e293b; height: 1px; padding: 0;"></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; font-size: 13px; font-weight: 600; width: 35%; vertical-align: top;">Account Role:</td>
                <td style="padding: 10px 0; color: #00f2fe; font-size: 14px; font-weight: 700; text-align: right; vertical-align: top; text-transform: capitalize;">{role_title}</td>
              </tr>
            </table>
          </div>

          <p style="margin: 0; color: #94a3b8; font-size: 14px;">Log in to your account anytime to start creating digital contracts, exploring opportunities, and managing transactions securely.</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; background: #0b0f19;">
          &copy; 2026 Contrax Inc. All rights reserved.<br>
          Automated welcome email sent to {user.email}.
        </div>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"Contrax Welcome <{email_user}>"
    target_email = str(user.email).strip().lower()
    msg['To'] = target_email
    msg.attach(MIMEText(text_body, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    context = ssl._create_unverified_context()

    email_sent = False
    try:
        with smtplib.SMTP_SSL(email_host, 465, context=context, timeout=12) as server:
            server.login(email_user, email_password)
            server.sendmail(email_user, [target_email], msg.as_string())
        email_sent = True
    except Exception as ssl_err:
        try:
            with smtplib.SMTP(email_host, 587, timeout=12) as server:
                server.starttls(context=context)
                server.login(email_user, email_password)
                server.sendmail(email_user, [target_email], msg.as_string())
            email_sent = True
        except Exception as tls_err:
            print(f"Welcome email dispatch error: {ssl_err} | {tls_err}")

    if email_sent:
        print(f"\n=======================================================")
        print(f"  [WELCOME EMAIL DISPATCHED]")
        print(f"  Target User: {user.username} ({user.email}) | Role: {user.role}")
        print(f"=======================================================\n")

    return email_sent, "Dispatched"



class SendEmailOTPAPI(APIView):

    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        is_login = request.data.get("is_login", False)

        if not email or "@" not in str(email) or "." not in str(email):
            return Response({"error": "A valid email address is required."}, status=status.HTTP_400_BAD_REQUEST)

        email = str(email).strip().lower()
        user_exists = User.objects.filter(email=email).exists()

        if is_login:
            if not user_exists:
                return Response({"error": "No registered account found with this email address. Please sign up first."}, status=status.HTTP_404_NOT_FOUND)
        else:
            if user_exists:
                return Response({"error": "An account with this email address already exists. Please sign in."}, status=status.HTTP_400_BAD_REQUEST)

        otp_code = str(random.randint(100000, 999999))

        EmailOTPVerification.objects.filter(email=email).delete()
        EmailOTPVerification.objects.create(
            email=email,
            otp_code=otp_code,
            is_verified=False
        )

        email_sent, provider_msg = send_smtp_email_otp(email, otp_code)

        if not email_sent:
            return Response({
                "error": f"Unable to send verification email via SMTP. Details: {provider_msg}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "message": f"Verification code sent to {email} successfully via SMTP email.",
            "email": email,
            "email_sent": True
        }, status=status.HTTP_200_OK)




class VerifyEmailOTPAPI(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        otp_code = request.data.get("otp")

        if not email or not otp_code:
            return Response({"error": "Email address and OTP code are required."}, status=status.HTTP_400_BAD_REQUEST)

        email = str(email).strip().lower()
        otp_code = str(otp_code).strip()

        try:
            record = EmailOTPVerification.objects.filter(email=email).latest('created_at')
            if record.otp_code == otp_code:
                record.is_verified = True
                record.save()
                return Response({"message": "Email verified successfully!", "verified": True}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid verification code. Please check your email and try again."}, status=status.HTTP_400_BAD_REQUEST)
        except EmailOTPVerification.DoesNotExist:
            return Response({"error": "No verification request found for this email. Please request a new code."}, status=status.HTTP_400_BAD_REQUEST)


class SendOTPAPI(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        phone_number = request.data.get("phone_number")
        if not phone_number or len(str(phone_number).strip()) < 8:
            return Response({"error": "A valid mobile number is required."}, status=status.HTTP_400_BAD_REQUEST)

        phone_number = str(phone_number).strip()
        otp_code = str(random.randint(100000, 999999))
        
        OTPVerification.objects.filter(phone_number=phone_number).delete()
        OTPVerification.objects.create(
            phone_number=phone_number,
            otp_code=otp_code,
            is_verified=False
        )

        real_sms_sent, provider_msg = send_real_sms_otp(phone_number, otp_code)

        return Response({
            "message": f"OTP sent to {phone_number} successfully.",
            "otp": otp_code,
            "phone_number": phone_number,
            "real_sms_sent": real_sms_sent,
            "provider_info": provider_msg
        }, status=status.HTTP_200_OK)



class VerifyOTPAPI(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        phone_number = request.data.get("phone_number")
        otp_code = request.data.get("otp")

        if not phone_number or not otp_code:
            return Response({"error": "Phone number and OTP code are required."}, status=status.HTTP_400_BAD_REQUEST)

        phone_number = str(phone_number).strip()
        otp_code = str(otp_code).strip()

        try:
            record = OTPVerification.objects.filter(phone_number=phone_number).latest('created_at')
            if record.otp_code == otp_code:
                record.is_verified = True
                record.save()
                return Response({"message": "OTP verified successfully!", "verified": True}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid OTP code. Please check and try again."}, status=status.HTTP_400_BAD_REQUEST)
        except OTPVerification.DoesNotExist:
            return Response({"error": "No OTP request found for this number. Please request a new OTP."}, status=status.HTTP_400_BAD_REQUEST)


class RegisterAPI(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if email:
            email = str(email).strip().lower()
            if User.objects.filter(email=email).exists():
                return Response({"error": "Email address is already registered with another account."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            # Send welcome email via SMTP
            try:
                send_welcome_email(user)
            except Exception as e:
                print(f"Welcome email trigger notice: {e}")

            return Response({
                "user": UserSerializer(user).data,
                "token": token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class LoginAPI(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        phone_number = request.data.get("phone_number")
        otp_code = request.data.get("otp")
        username = request.data.get("username")
        password = request.data.get("password")
        
        # Email + OTP Login
        if email and otp_code:
            email = str(email).strip().lower()
            otp_code = str(otp_code).strip()
            try:
                record = EmailOTPVerification.objects.filter(email=email).latest('created_at')
                if record.otp_code != otp_code:
                    return Response({"error": "Invalid email verification code."}, status=status.HTTP_400_BAD_REQUEST)
                record.is_verified = True
                record.save()
            except EmailOTPVerification.DoesNotExist:
                return Response({"error": "No verification request found for this email. Please request a new code."}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(email=email).first()
            if not user:
                return Response({"error": "No registered account found with this email address. Please sign up first."}, status=status.HTTP_404_NOT_FOUND)
            
            if user.is_superuser or user.is_staff:
                user.role = 'admin'
                user.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "user": UserSerializer(user).data,
                "token": token.key
            })

        # Phone + OTP Login
        if phone_number and otp_code:
            phone_number = str(phone_number).strip()
            otp_code = str(otp_code).strip()
            try:
                record = OTPVerification.objects.filter(phone_number=phone_number).latest('created_at')
                if record.otp_code != otp_code:
                    return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)
            except OTPVerification.DoesNotExist:
                return Response({"error": "No OTP found for this mobile number."}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(phone_number=phone_number).first()
            if not user:
                return Response({"error": "No registered account found with this mobile number. Please register first."}, status=status.HTTP_404_NOT_FOUND)
            
            if user.is_superuser or user.is_staff:
                user.role = 'admin'
                user.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "user": UserSerializer(user).data,
                "token": token.key
            })


        # Standard Username + Password Login
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_superuser or user.is_staff:
                user.role = 'admin'
                user.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "user": UserSerializer(user).data,
                "token": token.key
            })
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_400_BAD_REQUEST)



class UserAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        if request.user.is_superuser or request.user.is_staff:
            if request.user.role != 'admin':
                request.user.role = 'admin'
                request.user.save()
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        user = request.user
        action = request.data.get("action")
        
        if not action:
            return Response({"error": "action is required"}, status=status.HTTP_400_BAD_REQUEST)

        if action in ["update_profile", "update_details"]:
            username = request.data.get("username")
            email = request.data.get("email")
            phone_number = request.data.get("phone_number")
            bio = request.data.get("bio")
            specialty = request.data.get("specialty")
            profile_picture = request.data.get("profile_picture")
            password = request.data.get("password")

            if username and str(username).strip() and str(username).strip() != user.username:
                new_username = str(username).strip()
                if User.objects.filter(username=new_username).exclude(id=user.id).exists():
                    return Response({"error": "Username is already taken by another account."}, status=status.HTTP_400_BAD_REQUEST)
                user.username = new_username

            if email and str(email).strip() and str(email).strip().lower() != (user.email or '').lower():
                new_email = str(email).strip().lower()
                if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                    return Response({"error": "Email address is already registered with another account."}, status=status.HTTP_400_BAD_REQUEST)
                user.email = new_email

            if phone_number is not None:
                new_phone = str(phone_number).strip()
                if new_phone != (user.phone_number or '').strip():
                    if new_phone and User.objects.filter(phone_number=new_phone).exclude(id=user.id).exists():
                        return Response({"error": "Mobile number is already registered with another account."}, status=status.HTTP_400_BAD_REQUEST)
                    user.phone_number = new_phone if new_phone else None

            if bio is not None:
                user.bio = str(bio).strip()

            if specialty is not None:
                user.specialty = str(specialty).strip()

            if profile_picture is not None:
                user.profile_picture = profile_picture

            if password:
                clean_pass = str(password).strip()
                if clean_pass:
                    if len(clean_pass) < 6:
                        return Response({"error": "New password must be at least 6 characters long."}, status=status.HTTP_400_BAD_REQUEST)
                    user.set_password(clean_pass)

            user.save()
            return Response(UserSerializer(user).data)

        if action == "update_status":
            is_online = request.data.get("is_online")
            lat = request.data.get("latitude")
            lng = request.data.get("longitude")
            
            if is_online is not None:
                user.is_online = bool(is_online)
            if lat is not None:
                try:
                    user.latitude = float(lat)
                except ValueError:
                    return Response({"error": "invalid latitude format"}, status=status.HTTP_400_BAD_REQUEST)
            if lng is not None:
                try:
                    user.longitude = float(lng)
                except ValueError:
                    return Response({"error": "invalid longitude format"}, status=status.HTTP_400_BAD_REQUEST)
                
            user.save()
            return Response(UserSerializer(user).data)

        amount = request.data.get("amount")
        if amount is None:
            return Response({"error": "amount is required for this action"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = float(amount)
        except ValueError:
            return Response({"error": "invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "amount must be positive"}, status=status.HTTP_400_BAD_REQUEST)

        if action == "top_up":
            user.wallet_balance += amount
            user.save()
            return Response(UserSerializer(user).data)
        elif action == "withdraw":
            MIN_WITHDRAW = 100.0
            if amount < MIN_WITHDRAW:
                return Response({"error": f"Minimum withdrawal amount is ₹{MIN_WITHDRAW:.2f}."}, status=status.HTTP_400_BAD_REQUEST)
            if user.wallet_balance < amount:
                return Response({"error": "insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)
            user.wallet_balance -= amount
            user.save()
            return Response(UserSerializer(user).data)
            
        return Response({"error": f"unknown action '{action}'"}, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        if request.user.role != 'admin' and not request.user.is_superuser:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all().order_by('-date_joined')
        return Response(UserSerializer(users, many=True).data)

    def post(self, request, *args, **kwargs):
        if request.user.role != 'admin' and not request.user.is_superuser:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        target_user_id = request.data.get("target_user_id")
        action = request.data.get("action")

        if not target_user_id:
            return Response({"error": "target_user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if action in ["update_user_details", "update_details", "update_profile"]:
            username = request.data.get("username")
            email = request.data.get("email")
            phone_number = request.data.get("phone_number")
            role = request.data.get("role")
            specialty = request.data.get("specialty")
            wallet_balance = request.data.get("wallet_balance")
            bio = request.data.get("bio")
            profile_picture = request.data.get("profile_picture")
            password = request.data.get("password")

            if username and str(username).strip() and str(username).strip() != target_user.username:
                new_username = str(username).strip()
                if User.objects.filter(username=new_username).exclude(id=target_user.id).exists():
                    return Response({"error": "Username is already taken by another account."}, status=status.HTTP_400_BAD_REQUEST)
                target_user.username = new_username

            if email and str(email).strip() and str(email).strip().lower() != (target_user.email or '').lower():
                new_email = str(email).strip().lower()
                if User.objects.filter(email=new_email).exclude(id=target_user.id).exists():
                    return Response({"error": "Email address is already registered with another account."}, status=status.HTTP_400_BAD_REQUEST)
                target_user.email = new_email

            if phone_number is not None:
                new_phone = str(phone_number).strip()
                if new_phone != (target_user.phone_number or '').strip():
                    if new_phone and User.objects.filter(phone_number=new_phone).exclude(id=target_user.id).exists():
                        return Response({"error": "Mobile number is already registered with another account."}, status=status.HTTP_400_BAD_REQUEST)
                    target_user.phone_number = new_phone if new_phone else None

            if role in ['client', 'contractor', 'admin']:
                target_user.role = role

            if specialty is not None:
                target_user.specialty = str(specialty).strip()

            if wallet_balance is not None:
                try:
                    target_user.wallet_balance = float(wallet_balance)
                except (ValueError, TypeError):
                    pass

            if bio is not None:
                target_user.bio = str(bio).strip()

            if profile_picture is not None:
                target_user.profile_picture = profile_picture

            if password:
                clean_pass = str(password).strip()
                if clean_pass:
                    if len(clean_pass) < 6:
                        return Response({"error": "New password must be at least 6 characters long."}, status=status.HTTP_400_BAD_REQUEST)
                    target_user.set_password(clean_pass)

            target_user.save()
            return Response(UserSerializer(target_user).data)

        if action == "delete_user":
            target_user.delete()
            return Response({"message": "User deleted successfully"})

        if action == "update_role":
            new_role = request.data.get("role")
            if new_role in ['client', 'contractor', 'admin']:
                target_user.role = new_role
                target_user.save()
                return Response(UserSerializer(target_user).data)
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        if action == "update_specialty":
            new_specialty = request.data.get("specialty")
            if new_specialty is not None:
                target_user.specialty = str(new_specialty).strip()
                target_user.save()
                return Response(UserSerializer(target_user).data)
            return Response({"error": "Specialty parameter required"}, status=status.HTTP_400_BAD_REQUEST)

        if action == "adjust_balance":
            new_balance = request.data.get("wallet_balance")
            try:
                target_user.wallet_balance = float(new_balance)
                target_user.save()
                return Response(UserSerializer(target_user).data)
            except (ValueError, TypeError):
                return Response({"error": "Invalid balance amount"}, status=status.HTTP_400_BAD_REQUEST)

        if action == "toggle_online":
            target_user.is_online = not target_user.is_online
            target_user.save()
            return Response(UserSerializer(target_user).data)

        return Response({"error": "Invalid admin action"}, status=status.HTTP_400_BAD_REQUEST)

