import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../config/database.js';
import {
  borrowRequestTemplate,
  requestApprovedTemplate,
  requestRejectedTemplate,
  requestCompletedTemplate,
  requestCancelledTemplate,
  generalRequestResponseTemplate,
  newGeneralRequestTemplate,
} from './email.templates.js';
import type {
  BorrowRequestWithRelations,
  GeneralRequestResponseWithRelations,
  GeneralRequestWithRequester,
} from '../types/email.types.js';

/**
 * Initialize nodemailer transporter based on environment configuration
 */
function initializeTransporter() {
  if (!env.EMAIL_ENABLED) {
    logger.debug('Email service disabled via EMAIL_ENABLED=false');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
    });

    logger.debug('Email transporter initialized', {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
    });

    return transporter;
  } catch (error) {
    logger.error('Failed to initialize email transporter', error);
    return null;
  }
}

let transporter = initializeTransporter();

/**
 * Send an email without throwing errors
 * This ensures email failures never break API requests
 */
async function sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  try {
    if (!env.EMAIL_ENABLED) {
      logger.debug('Emails disabled, skipping send', { to, subject });
      return;
    }

    if (!transporter) {
      logger.warn('Email transporter not initialized, skipping send', { to, subject });
      return;
    }

    // Validate recipient email
    if (!to || !to.includes('@')) {
      logger.warn('Invalid recipient email, skipping send', { to, subject });
      return;
    }

    // Skip LDAP test accounts - these have no valid external email and cause bounce issues
    if (to.endsWith('@ldap.local')) {
      logger.debug('Skipping email to LDAP test account', { to, subject });
      return;
    }

    // Attempt to send
    const info = await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    logger.info('Email sent successfully', {
      to,
      subject,
      messageId: info.messageId,
    });
  } catch (error) {
    // CRITICAL: Never throw - log but continue
    logger.error('Failed to send email', {
      to,
      subject,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Notify item owner of a new borrow request
 */
export async function notifyBorrowRequest(request: BorrowRequestWithRelations): Promise<void> {
  try {
    const template = borrowRequestTemplate({
      ownerName: request.item.owner.name,
      requesterName: request.requester.name,
      itemTitle: request.item.title,
      message: request.message,
      startDate: request.startDate?.toLocaleDateString('fr-FR') || undefined,
      endDate: request.endDate?.toLocaleDateString('fr-FR') || undefined,
      viewRequestUrl: `${env.FRONTEND_URL}/requests`,
    });

    await sendEmail(request.item.owner.email, template.subject, template.html, template.text);
  } catch (error) {
    logger.error('Error in notifyBorrowRequest', error);
  }
}

/**
 * Notify requester that their borrow request was approved
 */
export async function notifyRequestApproved(request: BorrowRequestWithRelations): Promise<void> {
  try {
    const template = requestApprovedTemplate({
      requesterName: request.requester.name,
      ownerName: request.item.owner.name,
      itemTitle: request.item.title,
      responseMessage: request.responseMessage,
      viewRequestUrl: `${env.FRONTEND_URL}/requests`,
    });

    await sendEmail(request.requester.email, template.subject, template.html, template.text);
  } catch (error) {
    logger.error('Error in notifyRequestApproved', error);
  }
}

/**
 * Notify requester that their borrow request was rejected
 */
export async function notifyRequestRejected(request: BorrowRequestWithRelations): Promise<void> {
  try {
    const template = requestRejectedTemplate({
      requesterName: request.requester.name,
      ownerName: request.item.owner.name,
      itemTitle: request.item.title,
      responseMessage: request.responseMessage,
      viewRequestUrl: `${env.FRONTEND_URL}/requests`,
    });

    await sendEmail(request.requester.email, template.subject, template.html, template.text);
  } catch (error) {
    logger.error('Error in notifyRequestRejected', error);
  }
}

/**
 * Notify both parties that a borrow request was completed
 */
export async function notifyRequestCompleted(request: BorrowRequestWithRelations): Promise<void> {
  try {
    // Notify requester
    const requesterTemplate = requestCompletedTemplate({
      userName: request.requester.name,
      requesterName: request.requester.name,
      ownerName: request.item.owner.name,
      itemTitle: request.item.title,
    });

    await sendEmail(request.requester.email, requesterTemplate.subject, requesterTemplate.html, requesterTemplate.text);

    // Notify owner
    const ownerTemplate = requestCompletedTemplate({
      userName: request.item.owner.name,
      requesterName: request.requester.name,
      ownerName: request.item.owner.name,
      itemTitle: request.item.title,
    });

    await sendEmail(request.item.owner.email, ownerTemplate.subject, ownerTemplate.html, ownerTemplate.text);
  } catch (error) {
    logger.error('Error in notifyRequestCompleted', error);
  }
}

/**
 * Notify item owner that a borrow request was cancelled
 */
export async function notifyRequestCancelled(request: BorrowRequestWithRelations): Promise<void> {
  try {
    const template = requestCancelledTemplate({
      ownerName: request.item.owner.name,
      requesterName: request.requester.name,
      itemTitle: request.item.title,
    });

    await sendEmail(request.item.owner.email, template.subject, template.html, template.text);
  } catch (error) {
    logger.error('Error in notifyRequestCancelled', error);
  }
}

/**
 * Notify original requester of a new response to their general request
 */
export async function notifyGeneralRequestResponse(
  response: GeneralRequestResponseWithRelations,
  originalRequester: GeneralRequestWithRequester,
): Promise<void> {
  try {
    const template = generalRequestResponseTemplate({
      requesterName: originalRequester.requester.name,
      responderName: response.responder.name,
      requestTitle: originalRequester.title,
      itemTitle: response.item?.title,
      message: response.message,
      viewRequestUrl: `${env.FRONTEND_URL}/general-requests`,
    });

    await sendEmail(originalRequester.requester.email, template.subject, template.html, template.text);
  } catch (error) {
    logger.error('Error in notifyGeneralRequestResponse', error);
  }
}

/**
 * Notify all users about a new general request (except the requester)
 */
export async function notifyNewGeneralRequest(request: GeneralRequestWithRequester): Promise<void> {
  try {
    // Get all users except the requester and LDAP test accounts
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: request.requesterId,
            },
          },
          {
            email: {
              not: {
                endsWith: '@ldap.local',
              },
            },
          },
        ],
      },
      select: {
        email: true,
        name: true,
      },
    });

    if (users.length === 0) {
      logger.debug('No users to notify for new general request', { requestId: request.id });
      return;
    }

    const template = newGeneralRequestTemplate({
      requesterName: request.requester.name,
      requestTitle: request.title,
      description: request.description,
      startDate: request.startDate,
      endDate: request.endDate,
      viewRequestUrl: `${env.FRONTEND_URL}/general-requests`,
    });

    // Send emails to all users in parallel
    const emailPromises = users.map((user: { email: string; name: string }) =>
      sendEmail(user.email, template.subject, template.html, template.text)
    );

    await Promise.allSettled(emailPromises);

    logger.info('Notified users of new general request', {
      requestId: request.id,
      recipientCount: users.length,
    });
  } catch (error) {
    logger.error('Error in notifyNewGeneralRequest', error);
  }
}

export const emailService = {
  notifyBorrowRequest,
  notifyRequestApproved,
  notifyRequestRejected,
  notifyRequestCompleted,
  notifyRequestCancelled,
  notifyGeneralRequestResponse,
  notifyNewGeneralRequest,
};
