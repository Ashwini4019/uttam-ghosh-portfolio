import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { config } from "./config.js";
import { normalizeEmail, validateEmail } from "./validation.js";

export { normalizeEmail };

export function isValidEmail(email) {
  return validateEmail(email).ok;
}

const DB_FILE = path.join(config.dataDir, "newsletter.json");

const defaultDb = () => ({
  subscribers: [],
  publishEvents: [],
  notificationLog: [],
});

let cache = null;
let writeQueue = Promise.resolve();

function ensureDataDir() {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
}

function readDb() {
  ensureDataDir();
  if (cache) return cache;

  if (!fs.existsSync(DB_FILE)) {
    cache = defaultDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2), "utf8");
    return cache;
  }

  try {
    cache = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    cache = defaultDb();
  }

  return cache;
}

function persistDb() {
  ensureDataDir();
  writeQueue = writeQueue.then(() =>
    fs.promises.writeFile(DB_FILE, JSON.stringify(cache, null, 2), "utf8")
  );
  return writeQueue;
}

function mutate(mutator) {
  const db = readDb();
  const result = mutator(db);
  cache = db;
  return persistDb().then(() => result);
}

export function findSubscriberByEmail(email) {
  const normalized = normalizeEmail(email);
  return readDb().subscribers.find((s) => s.email === normalized) || null;
}

export function findSubscriberByToken(token, field = "confirmToken") {
  return readDb().subscribers.find((s) => s[field] === token) || null;
}

export function listSubscribers({ search = "", status = "all" } = {}) {
  const query = search.trim().toLowerCase();
  let rows = [...readDb().subscribers];

  if (status !== "all") {
    rows = rows.filter((s) => s.status === status);
  }

  if (query) {
    rows = rows.filter(
      (s) =>
        s.email.includes(query) ||
        (s.name || "").toLowerCase().includes(query)
    );
  }

  return rows.sort(
    (a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt)
  );
}

export function getSubscriberStats() {
  const subscribers = readDb().subscribers;
  return {
    total: subscribers.length,
    active: subscribers.filter((s) => s.status === "active").length,
    pending: subscribers.filter((s) => s.status === "pending").length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
  };
}

export function createSubscriber({ name = "", email, status = "pending" }) {
  const normalized = normalizeEmail(email);
  const existing = findSubscriberByEmail(normalized);

  if (existing) {
    return mutate(() => {
      if (name.trim()) {
        existing.name = name.trim();
      }
      existing.status = status;
      existing.subscribedAt = new Date().toISOString();
      if (status === "active") {
        existing.confirmedAt = new Date().toISOString();
      }
      existing.confirmToken = randomUUID();
      if (!existing.unsubscribeToken) {
        existing.unsubscribeToken = randomUUID();
      }
      return { subscriber: existing, resubscribed: true, duplicate: false };
    });
  }

  return mutate((db) => {
    const subscriber = {
      id: randomUUID(),
      name: name.trim(),
      email: normalized,
      status,
      subscribedAt: new Date().toISOString(),
      confirmedAt: status === "active" ? new Date().toISOString() : null,
      lastNotificationSent: null,
      confirmToken: randomUUID(),
      unsubscribeToken: randomUUID(),
    };
    db.subscribers.push(subscriber);
    return { subscriber, duplicate: false, resubscribed: false };
  });
}

export function confirmSubscriber(token) {
  return mutate((db) => {
    const subscriber = db.subscribers.find((s) => s.confirmToken === token);
    if (!subscriber) return { ok: false, reason: "invalid" };
    if (subscriber.status === "active") return { ok: true, subscriber, already: true };

    subscriber.status = "active";
    subscriber.confirmedAt = new Date().toISOString();
    return { ok: true, subscriber, already: false };
  });
}

export function unsubscribeSubscriber(token) {
  return mutate((db) => {
    const subscriber = db.subscribers.find((s) => s.unsubscribeToken === token);
    if (!subscriber) return { ok: false, reason: "invalid" };
    subscriber.status = "unsubscribed";
    return { ok: true, subscriber };
  });
}

export function deleteSubscriber(id) {
  return mutate((db) => {
    const index = db.subscribers.findIndex((s) => s.id === id);
    if (index === -1) return false;
    db.subscribers.splice(index, 1);
    return true;
  });
}

export function setSubscriberStatus(id, status) {
  return mutate((db) => {
    const subscriber = db.subscribers.find((s) => s.id === id);
    if (!subscriber) return null;
    subscriber.status = status;
    if (status === "active" && !subscriber.confirmedAt) {
      subscriber.confirmedAt = new Date().toISOString();
    }
    return subscriber;
  });
}

export function createPublishEvent(payload) {
  return mutate((db) => {
    const event = {
      id: randomUUID(),
      contentType: payload.contentType || "portfolio_update",
      title: payload.title || "Portfolio Update",
      description: payload.description || "",
      imageUrl: payload.imageUrl || "",
      linkUrl: payload.linkUrl || config.siteUrl,
      createdAt: new Date().toISOString(),
      emailSentAt: null,
      fingerprint: payload.fingerprint || null,
    };

    if (event.fingerprint) {
      const duplicate = db.publishEvents.find(
        (item) =>
          item.fingerprint === event.fingerprint &&
          Date.now() - new Date(item.createdAt).getTime() < 60_000
      );
      if (duplicate) return { event: duplicate, duplicate: true };
    }

    db.publishEvents.push(event);
    return { event, duplicate: false };
  });
}

export function getActiveSubscribers() {
  return readDb().subscribers.filter((s) => s.status === "active");
}

export function hasNotificationBeenSent(subscriberId, publishEventId) {
  return readDb().notificationLog.some(
    (entry) =>
      entry.subscriberId === subscriberId &&
      entry.publishEventId === publishEventId
  );
}

export function logNotification(subscriberId, publishEventId) {
  return mutate((db) => {
    db.notificationLog.push({
      id: randomUUID(),
      subscriberId,
      publishEventId,
      sentAt: new Date().toISOString(),
    });

    const subscriber = db.subscribers.find((s) => s.id === subscriberId);
    if (subscriber) {
      subscriber.lastNotificationSent = new Date().toISOString();
    }

    const event = db.publishEvents.find((e) => e.id === publishEventId);
    if (event && !event.emailSentAt) {
      event.emailSentAt = new Date().toISOString();
    }
  });
}

export function listPublishEvents(limit = 50) {
  return [...readDb().publishEvents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}
