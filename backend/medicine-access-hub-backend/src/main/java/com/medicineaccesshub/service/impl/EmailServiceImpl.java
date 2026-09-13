package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.EmailType;
import com.medicineaccesshub.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private static final String FROM_ADDRESS = "noreply@medicineaccesshub.local";
    private static final String APP_NAME = "Medicine Access Hub";

    private final JavaMailSender mailSender;

    private String htmlHeader() {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Medicine Access Hub</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                         style="background-color:#f0fdf4;padding:32px 0;">
                    <tr><td align="center">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="600"
                             style="background-color:#ffffff;border-radius:12px;
                                    box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

                        <tr>
                          <td style="background-color:#0f766e;padding:28px 40px;text-align:center;">
                            <span style="color:#ffffff;font-size:22px;font-weight:700;
                                         letter-spacing:0.5px;">Medicine Access Hub</span>
                          </td>
                        </tr>

                        <tr><td style="padding:40px 40px 32px;">
                """;
    }

    private String htmlFooter() {
        return """
                        </td></tr>

                        <tr>
                          <td style="background-color:#f8fafc;padding:20px 40px;text-align:center;
                                     border-top:1px solid #e2e8f0;">
                            <p style="margin:0;font-size:12px;color:#94a3b8;">
                              You are receiving this email because of activity on your Medicine Access Hub account.<br>
                              If this wasn't you, please ignore this message.<br>
                              &copy; 2026 Medicine Access Hub. All rights reserved.
                            </p>
                          </td>
                        </tr>

                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """;
    }

    private String buildOtpEmailHtml(User user, String otp, EmailType otpType) {
        String heading = switch (otpType) {
            case REGISTRATION_OTP -> "Verify your account &#128274;";
            case LOGIN_OTP -> "Your login verification code &#128272;";
            case PASSWORD_RESET -> "Reset your password &#128273;";
        };

        String intro = switch (otpType) {
            case REGISTRATION_OTP -> "Use the code below to verify your email and activate your account.";
            case LOGIN_OTP -> "Use the code below to complete your login.";
            case PASSWORD_RESET -> "Use the code below to reset your password.";
        };

        String body = """
                <h2 style="margin:0 0 16px;font-size:24px;color:#0f172a;font-weight:700;">
                    %s
                </h2>
                <p style="margin:0 0 12px;font-size:15px;color:#475569;">
                    Hi <strong>%s</strong>,
                </p>
                <p style="margin:0 0 12px;font-size:15px;color:#475569;">
                    %s
                </p>
                <div style="
                    font-size:32px;
                    font-weight:700;
                    letter-spacing:8px;
                    text-align:center;
                    padding:20px;
                    background:#f0fdf4;
                    border-radius:10px;
                    margin:20px 0;
                    color:#0f766e;
                ">
                    %s
                </div>
                <p style="margin:0;font-size:14px;color:#64748b;">
                    This code will expire in 5 minutes. Never share it with anyone.
                </p>
                """.formatted(heading, escapeHtml(user.getName()), intro, escapeHtml(otp));

        return htmlHeader() + body + htmlFooter();
    }

    private String buildWelcomeHtml(User user) {
        String body = """
                <h2 style="margin:0 0 16px;font-size:24px;color:#0f172a;font-weight:700;">
                    Welcome to %s, %s! &#127881;
                </h2>
                <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#475569;">
                    Your account has been verified and is ready to use.
                </p>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
                    You can now search for medicines, locate nearby pharmacies with live stock,
                    and reserve what you need in just a few taps.
                </p>
                """.formatted(APP_NAME, escapeHtml(user.getName()));

        return htmlHeader() + body + htmlFooter();
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }

    private void doSend(String to, String subject, String htmlBody, String logTag) {
        log.info("[EMAIL] Sending type={} to={} subject=\"{}\" thread={}",
                logTag, to, subject, Thread.currentThread().getName());

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            log.info("[EMAIL] Sent successfully: type={} to={}", logTag, to);
        } catch (MessagingException e) {
            log.error("[EMAIL] SMTP failure: type={} to={} error={}", logTag, to, e.getMessage(), e);
        } catch (Exception e) {
            log.error("[EMAIL] Unexpected failure: type={} to={} error={}", logTag, to, e.getMessage(), e);
        }
    }

    @Override
    @Async("taskExecutor")
    public void sendOtpEmail(User user, String otp, EmailType otpType) {
        try {
            log.info("[EMAIL] Preparing {} email for user id={} name={}", otpType, user.getId(), user.getName());
            String html = buildOtpEmailHtml(user, otp, otpType);
            String subject = switch (otpType) {
                case REGISTRATION_OTP -> "Verify your email - Medicine Access Hub";
                case LOGIN_OTP -> "Your login code - Medicine Access Hub";
                case PASSWORD_RESET -> "Reset your password - Medicine Access Hub";
            };
            doSend(user.getEmail(), subject, html, otpType.name());
        } catch (Exception e) {
            log.error("[EMAIL] Failed to send {} email to {}: {}", otpType, user.getEmail(), e.getMessage());
        }
    }

    @Override
    @Async("taskExecutor")
    public void sendWelcomeEmail(User user) {
        try {
            log.info("[EMAIL] Preparing WELCOME email for user id={} name={}", user.getId(), user.getName());
            String html = buildWelcomeHtml(user);
            doSend(user.getEmail(), "Welcome to Medicine Access Hub!", html, "WELCOME");
        } catch (Exception e) {
            log.error("[EMAIL] Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
