import { config } from "../config.js";
import {
  createPublishEvent,
  getActiveSubscribers,
  hasNotificationBeenSent,
  logNotification,
} from "../db.js";
import { sendNewsletterEmail } from "./emailService.js";

const queue = [];
let processing = false;
let timer = null;

export async function enqueuePublishNotifications(updates = []) {
  const jobs = [];

  for (const update of updates) {
    const result = await createPublishEvent(update);
    if (result?.event && !result.duplicate) {
      jobs.push(result.event);
    }
  }

  if (!jobs.length) {
    return { queued: 0, events: [] };
  }

  for (const event of jobs) {
    queue.push({ type: "publish", event });
  }

  scheduleProcessing();

  return { queued: jobs.length, events: jobs };
}

function scheduleProcessing() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    processQueue();
  }, config.queueDelayMs);
}

async function processQueue() {
  if (processing || !queue.length) return;
  processing = true;

  try {
    while (queue.length) {
      const job = queue.shift();
      if (job.type === "publish") {
        await processPublishEvent(job.event);
      }

      if (queue.length) {
        await sleep(config.queueDelayMs);
      }
    }
  } finally {
    processing = false;
    if (queue.length) scheduleProcessing();
  }
}

async function processPublishEvent(event) {
  if (!event?.id) {
    console.warn("[newsletter] Skipping invalid publish job.");
    return;
  }

  const subscribers = getActiveSubscribers();
  let sent = 0;

  for (let i = 0; i < subscribers.length; i += config.queueBatchSize) {
    const batch = subscribers.slice(i, i + config.queueBatchSize);

    await Promise.all(
      batch.map(async (subscriber) => {
        if (hasNotificationBeenSent(subscriber.id, event.id)) return;

        try {
          await sendNewsletterEmail(subscriber, event);
          await logNotification(subscriber.id, event.id);
          sent += 1;
        } catch (error) {
          console.error(
            `[newsletter] Failed to email ${subscriber.email}:`,
            error.message
          );
        }
      })
    );

    if (i + config.queueBatchSize < subscribers.length) {
      await sleep(config.queueDelayMs);
    }
  }

  console.log(
    `[newsletter] Sent "${event.title}" to ${sent}/${subscribers.length} subscribers`
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getQueueLength() {
  return queue.length;
}
