import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const reviewStatusEnum = pgEnum("review_status", ["draft", "published", "archived"]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const userRoleEnum = pgEnum("user_role", ["user", "moderator", "admin"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "comment",
  "like",
  "follow",
  "system",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  password: text("password").notNull(),
  displayName: varchar("display_name", { length: 100 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<"oauth" | "oidc" | "email" | "webauthn">().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => ({
    compoundPk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
    userIdx: index("accounts_user_id_idx").on(table.userId),
  }),
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    compositePk: primaryKey({ columns: [table.identifier, table.token] }),
  }),
);

export const authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credential_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (table) => ({
    userIdx: index("authenticators_user_id_idx").on(table.userId),
  }),
);

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  generation: varchar("generation", { length: 100 }),
  imageUrl: text("image_url"),
  specs: jsonb("specs"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCars = pgTable("user_cars", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  nickname: varchar("nickname", { length: 100 }),
  purchaseDate: timestamp("purchase_date"),
  mileage: integer("mileage"),
  modifications: text("modifications"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  pros: text("pros"),
  cons: text("cons"),
  status: reviewStatusEnum("status").default("draft").notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewMedia = pgTable("review_media", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  type: mediaTypeEnum("type").notNull(),
  altText: text("alt_text"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    reviewId: integer("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: integer("parent_id"),
    content: text("content").notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    isEdited: boolean("is_edited").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    selfReference: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "comments_parent_id_fkey",
    }).onDelete("cascade"),
  }),
);

export const reviewLikes = pgTable(
  "review_likes",
  {
    reviewId: integer("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.reviewId, table.userId] }),
  }),
);

export const commentLikes = pgTable(
  "comment_likes",
  {
    commentId: integer("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.commentId, table.userId] }),
  }),
);

export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  }),
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reviewId: integer("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.reviewId] }),
  }),
);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
  type: notificationTypeEnum("type").notNull(),
  entityId: integer("entity_id"),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  authenticators: many(authenticators),
  reviews: many(reviews),
  comments: many(comments),
  userCars: many(userCars),
  reviewLikes: many(reviewLikes),
  commentLikes: many(commentLikes),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "followers" }),
  bookmarks: many(bookmarks),
  notifications: many(notifications, { relationName: "notificationRecipient" }),
  notificationActors: many(notifications, { relationName: "notificationActor" }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  author: one(users, {
    fields: [reviews.authorId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [reviews.carId],
    references: [cars.id],
  }),
  media: many(reviewMedia),
  comments: many(comments),
  likes: many(reviewLikes),
  bookmarks: many(bookmarks),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  review: one(reviews, {
    fields: [comments.reviewId],
    references: [reviews.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "parentComment",
  }),
  replies: many(comments, { relationName: "parentComment" }),
  likes: many(commentLikes),
}));

export const carsRelations = relations(cars, ({ many }) => ({
  reviews: many(reviews),
  userCars: many(userCars),
}));

export const userCarsRelations = relations(userCars, ({ one }) => ({
  user: one(users, {
    fields: [userCars.userId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [userCars.carId],
    references: [cars.id],
  }),
}));

export const reviewMediaRelations = relations(reviewMedia, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewMedia.reviewId],
    references: [reviews.id],
  }),
}));

export const reviewLikesRelations = relations(reviewLikes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewLikes.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewLikes.userId],
    references: [users.id],
  }),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  review: one(reviews, {
    fields: [bookmarks.reviewId],
    references: [reviews.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "notificationRecipient",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "notificationActor",
  }),
}));
