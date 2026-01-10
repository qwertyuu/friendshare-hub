import { env } from '../config/env.js';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Base email template with FriendShare Hub branding
 */
function baseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FriendShare Hub</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">FriendShare Hub</h1>
                <p style="color: #E0E7FF; margin: 5px 0 0 0; font-size: 14px;">Partage communautaire d'objets</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px; color: #374151; line-height: 1.6;">
                ${content}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0; font-size: 12px;">
                  Visitez <a href="${env.FRONTEND_URL}" style="color: #4F46E5; text-decoration: none; font-weight: bold;">FriendShare Hub</a>
                </p>
                <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 11px;">
                  Vous recevez ce message parce que vous faites partie de la communauté FriendShare Hub
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

/**
 * Email template for new borrow request (sent to item owner)
 */
export function borrowRequestTemplate(data: {
  ownerName: string;
  requesterName: string;
  itemTitle: string;
  message?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  viewRequestUrl: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 22px;">Nouvelle demande d'emprunt</h2>
    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
      Bonjour ${data.ownerName},
    </p>
    <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
      <strong>${data.requesterName}</strong> souhaite emprunter votre article : <strong>${data.itemTitle}</strong>
    </p>

    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">Période demandée :</p>
      ${data.startDate ? `<p style="color: #374151; font-size: 14px; margin: 0 0 8px 0;"><strong>Du :</strong> ${data.startDate}</p>` : ''}
      ${data.endDate ? `<p style="color: #374151; font-size: 14px; margin: 0 0 10px 0;"><strong>Au :</strong> ${data.endDate}</p>` : ''}
      ${data.message ? `
        <p style="color: #6b7280; font-size: 14px; margin: 15px 0 5px 0; font-weight: bold;">Message :</p>
        <p style="color: #374151; font-size: 14px; margin: 0; font-style: italic;">"${data.message}"</p>
      ` : ''}
    </div>

    <table cellpadding="0" cellspacing="0" style="margin: 25px 0; width: 100%;">
      <tr>
        <td align="center">
          <a href="${data.viewRequestUrl}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Voir la demande
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
      Veuillez examiner cette demande et répondre à ${data.requesterName}.
    </p>
  `;

  const text = `Nouvelle demande d'emprunt\n\nBonjour ${data.ownerName},\n\n${data.requesterName} souhaite emprunter votre article : ${data.itemTitle}\n\nPériode demandée :\n${data.startDate ? `Du : ${data.startDate}\n` : ''}${data.endDate ? `Au : ${data.endDate}\n` : ''}\n${data.message ? `Message : "${data.message}"\n\n` : ''}Voir et répondre à cette demande : ${data.viewRequestUrl}`;

  return {
    subject: `Nouvelle demande d'emprunt : "${data.itemTitle}"`,
    html: baseEmailTemplate(content),
    text,
  };
}

/**
 * Email template for approved borrow request (sent to requester)
 */
export function requestApprovedTemplate(data: {
  requesterName: string;
  ownerName: string;
  itemTitle: string;
  responseMessage?: string | null;
  viewRequestUrl: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 22px;">✓ Demande approuvée</h2>
    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
      Bonjour ${data.requesterName},
    </p>
    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
      Bonne nouvelle ! ${data.ownerName} a approuvé votre demande d'emprunt pour <strong>${data.itemTitle}</strong>.
    </p>

    ${data.responseMessage ? `
      <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
        <p style="color: #065f46; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Message du propriétaire :</p>
        <p style="color: #065f46; font-size: 14px; margin: 0; font-style: italic;">"${data.responseMessage}"</p>
      </div>
    ` : ''}

    <table cellpadding="0" cellspacing="0" style="margin: 25px 0; width: 100%;">
      <tr>
        <td align="center">
          <a href="${data.viewRequestUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Voir les détails
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
      Veuillez vous coordonner avec ${data.ownerName} pour organiser la récupération.
    </p>
  `;

  const text = `Demande approuvée\n\nBonjour ${data.requesterName},\n\nBonne nouvelle ! ${data.ownerName} a approuvé votre demande d'emprunt pour ${data.itemTitle}.\n\n${data.responseMessage ? `Message du propriétaire : "${data.responseMessage}"\n\n` : ''}Voir les détails : ${data.viewRequestUrl}`;

  return {
    subject: `Demande approuvée : "${data.itemTitle}"`,
    html: baseEmailTemplate(content),
    text,
  };
}

/**
 * Email template for rejected borrow request (sent to requester)
 */
export function requestRejectedTemplate(data: {
  requesterName: string;
  ownerName: string;
  itemTitle: string;
  responseMessage?: string | null;
  viewRequestUrl: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 22px;">Demande refusée</h2>
    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
      Bonjour ${data.requesterName},
    </p>
    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
      Malheureusement, ${data.ownerName} ne peut pas accéder à votre demande d'emprunt pour <strong>${data.itemTitle}</strong>.
    </p>

    ${data.responseMessage ? `
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <p style="color: #7f1d1d; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Message du propriétaire :</p>
        <p style="color: #7f1d1d; font-size: 14px; margin: 0; font-style: italic;">"${data.responseMessage}"</p>
      </div>
    ` : ''}

    <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
      Vous pouvez consulter d'autres articles dans la communauté ou soumettre une nouvelle demande.
    </p>
  `;

  const text = `Demande refusée\n\nBonjour ${data.requesterName},\n\nMalheureusement, ${data.ownerName} ne peut pas accéder à votre demande d'emprunt pour ${data.itemTitle}.\n\n${data.responseMessage ? `Message du propriétaire : "${data.responseMessage}"\n\n` : ''}Vous pouvez consulter d'autres articles ou soumettre une nouvelle demande sur ${data.viewRequestUrl}`;

  return {
    subject: `Demande refusée : "${data.itemTitle}"`,
    html: baseEmailTemplate(content),
    text,
  };
}

/**
 * Email template for completed borrow request
 */
export function requestCompletedTemplate(data: {
  userName: string;
  requesterName: string;
  ownerName: string;
  itemTitle: string;
}): EmailTemplate {
  const isRequester = data.userName === data.requesterName;
  const otherPersonName = isRequester ? data.ownerName : data.requesterName;

  const content = `
    <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 22px;">✓ Emprunt complété</h2>
    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
      Bonjour ${data.userName},
    </p>
    <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
      L'emprunt de <strong>${data.itemTitle}</strong> a été marqué comme complété. Merci de votre participation à la communauté FriendShare Hub !
    </p>

    <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
      <p style="color: #065f46; font-size: 14px; margin: 0;">
        Un grand merci à ${otherPersonName} pour cette transaction !
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
      Continuez à explorer les articles de la communauté et à partager les vôtres.
    </p>
  `;

  const text = `Emprunt complété\n\nBonjour ${data.userName},\n\nL'emprunt de ${data.itemTitle} a été marqué comme complété.\n\nMerci de votre participation à FriendShare Hub !\n\nUn grand merci à ${otherPersonName} pour cette transaction !`;

  return {
    subject: `Emprunt complété : "${data.itemTitle}"`,
    html: baseEmailTemplate(content),
    text,
  };
}

/**
 * Email template for cancelled borrow request (sent to owner)
 */
export function requestCancelledTemplate(data: {
  ownerName: string;
  requesterName: string;
  itemTitle: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #d97706; margin: 0 0 20px 0; font-size: 22px;">Demande annulée</h2>
    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
      Bonjour ${data.ownerName},
    </p>
    <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
      ${data.requesterName} a annulé sa demande d'emprunt pour <strong>${data.itemTitle}</strong>.
    </p>

    <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0;">
      <p style="color: #78350f; font-size: 14px; margin: 0;">
        Votre article est de nouveau disponible pour d'autres demandes.
      </p>
    </div>
  `;

  const text = `Demande annulée\n\nBonjour ${data.ownerName},\n\n${data.requesterName} a annulé sa demande d'emprunt pour ${data.itemTitle}.\n\nVotre article est de nouveau disponible pour d'autres demandes.`;

  return {
    subject: `Demande annulée : "${data.itemTitle}"`,
    html: baseEmailTemplate(content),
    text,
  };
}

/**
 * Email template for general request response (sent to original requester)
 */
export function generalRequestResponseTemplate(data: {
  requesterName: string;
  responderName: string;
  requestTitle: string;
  itemTitle?: string | null;
  message?: string | null;
  viewRequestUrl: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #2563eb; margin: 0 0 20px 0; font-size: 22px;">Nouvelle réponse à votre demande</h2>
    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
      Bonjour ${data.requesterName},
    </p>
    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
      ${data.responderName} a répondu à votre demande : <strong>${data.requestTitle}</strong>
    </p>

    <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
      ${data.itemTitle ? `<p style="color: #1e40af; font-size: 14px; margin: 0 0 10px 0;"><strong>Article proposé :</strong> ${data.itemTitle}</p>` : ''}
      ${data.message ? `
        <p style="color: #1e40af; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Message :</p>
        <p style="color: #1e40af; font-size: 14px; margin: 0; font-style: italic;">"${data.message}"</p>
      ` : ''}
    </div>

    <table cellpadding="0" cellspacing="0" style="margin: 25px 0; width: 100%;">
      <tr>
        <td align="center">
          <a href="${data.viewRequestUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Voir la réponse
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
      Vous pouvez maintenant contacter ${data.responderName} pour discuter des modalités.
    </p>
  `;

  const text = `Nouvelle réponse à votre demande\n\nBonjour ${data.requesterName},\n\n${data.responderName} a répondu à votre demande : ${data.requestTitle}\n\n${data.itemTitle ? `Article proposé : ${data.itemTitle}\n\n` : ''}${data.message ? `Message : "${data.message}"\n\n` : ''}Voir la réponse : ${data.viewRequestUrl}`;

  return {
    subject: `Nouvelle réponse : "${data.requestTitle}"`,
    html: baseEmailTemplate(content),
    text,
  };
}
