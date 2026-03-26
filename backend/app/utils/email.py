import logging
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)


async def send_email(to_email: str, subject: str, body_html: str) -> bool:
    """Send an email notification asynchronously."""
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured, skipping email send")
        return False
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        message["To"] = to_email
        message.attach(MIMEText(body_html, "html"))

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_booking_confirmation(user_email: str, user_name: str, booking: dict, restaurant: dict) -> None:
    subject = f"Booking Confirmed - {restaurant.get('name', 'Restaurant')}"
    body = f"""
    <html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #dc2626; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">TableEase</h1>
    </div>
    <div style="padding: 30px;">
        <h2>Your Reservation is Confirmed! 🎉</h2>
        <p>Hi {user_name},</p>
        <p>Your table has been successfully reserved at <strong>{restaurant.get('name')}</strong>.</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Reservation Details</h3>
            <p><strong>Confirmation Code:</strong> {booking.get('confirmation_code')}</p>
            <p><strong>Date:</strong> {booking.get('booking_date')}</p>
            <p><strong>Time:</strong> {booking.get('booking_time')}</p>
            <p><strong>Party Size:</strong> {booking.get('party_size')} guests</p>
            <p><strong>Restaurant:</strong> {restaurant.get('name')}</p>
            <p><strong>Address:</strong> {restaurant.get('address')}, {restaurant.get('city')}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
            Please keep your confirmation code handy. If you need to cancel or modify your reservation,
            log in to your TableEase account.
        </p>
    </div>
    <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>TableEase - Restaurant Table Booking</p>
    </div>
    </body></html>
    """
    await send_email(user_email, subject, body)


async def send_booking_cancellation(user_email: str, user_name: str, booking: dict, restaurant: dict) -> None:
    subject = f"Booking Cancelled - {restaurant.get('name', 'Restaurant')}"
    body = f"""
    <html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #dc2626; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">TableEase</h1>
    </div>
    <div style="padding: 30px;">
        <h2>Booking Cancelled</h2>
        <p>Hi {user_name},</p>
        <p>Your booking at <strong>{restaurant.get('name')}</strong> has been cancelled.</p>
        <p><strong>Confirmation Code:</strong> {booking.get('confirmation_code')}</p>
        <p><strong>Original Date:</strong> {booking.get('booking_date')} at {booking.get('booking_time')}</p>
        <p>We hope to see you again soon!</p>
    </div>
    </body></html>
    """
    await send_email(user_email, subject, body)
