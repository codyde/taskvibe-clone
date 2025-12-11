import type { Issue, Project, WebhookEvent } from '../db/schema';

// Webhook payload structure
export type WebhookPayload = {
  event: WebhookEvent;
  timestamp: string;
  workspaceId: string;
  data: {
    action: 'created' | 'updated' | 'deleted';
    resource: Issue | Project | { id: string };
    changes?: Record<string, { old: unknown; new: unknown }>;
  };
};

// Generate HMAC signature for webhook payload
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Send webhook to configured URL
export async function sendWebhook(
  workspaceId: string,
  event: WebhookEvent,
  data: WebhookPayload['data']
): Promise<void> {
  // Dynamic imports to avoid circular dependencies
  const { db } = await import('../db');
  const { webhooks } = await import('../db/schema');
  const { eq, and } = await import('drizzle-orm');

  try {
    // Get webhook config for workspace
    const webhook = await db.query.webhooks.findFirst({
      where: and(eq(webhooks.workspaceId, workspaceId), eq(webhooks.enabled, true)),
    });

    if (!webhook) {
      return; // No webhook configured or disabled
    }

    // Check if this event type is enabled
    if (!webhook.events.includes(event)) {
      return; // Event type not subscribed
    }

    // Build payload
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      workspaceId,
      data,
    };

    const payloadString = JSON.stringify(payload);

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'LinearClone-Webhook/1.0',
    };

    // Add signature if secret is configured
    if (webhook.secret) {
      const signature = await generateSignature(payloadString, webhook.secret);
      headers['X-Webhook-Signature'] = `sha256=${signature}`;
    }

    // Fire-and-forget webhook delivery
    fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadString,
    }).catch((error) => {
      console.error(`[Webhook] Failed to deliver to ${webhook.url}:`, error);
    });
  } catch (error) {
    console.error(`[Webhook] Error processing webhook for workspace ${workspaceId}:`, error);
  }
}

// Helper to compute changes between old and new objects
export function computeChanges<T extends Record<string, unknown>>(
  oldObj: T,
  newObj: Partial<T>,
  fieldsToTrack: (keyof T)[]
): Record<string, { old: unknown; new: unknown }> | undefined {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  for (const field of fieldsToTrack) {
    if (field in newObj && oldObj[field] !== newObj[field]) {
      changes[field as string] = {
        old: oldObj[field],
        new: newObj[field],
      };
    }
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
}

// Send test webhook to verify endpoint connectivity
export async function sendTestWebhook(workspaceId: string): Promise<{ success: boolean; error?: string }> {
  const { db } = await import('../db');
  const { webhooks } = await import('../db/schema');
  const { eq } = await import('drizzle-orm');

  try {
    const webhook = await db.query.webhooks.findFirst({
      where: eq(webhooks.workspaceId, workspaceId),
    });

    if (!webhook) {
      return { success: false, error: 'No webhook configured' };
    }

    const payload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      workspaceId,
      data: {
        action: 'test',
        message: 'This is a test webhook from Momentum',
      },
    };

    const payloadString = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'LinearClone-Webhook/1.0',
    };

    if (webhook.secret) {
      const signature = await generateSignature(payloadString, webhook.secret);
      headers['X-Webhook-Signature'] = `sha256=${signature}`;
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadString,
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
