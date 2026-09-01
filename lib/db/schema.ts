import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  serial,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  bigint,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";

export const languageEnum = pgEnum("language_enum", ["en", "ar"]);
export const leadStatusEnum = pgEnum("lead_status_enum", ["new", "read", "archived"]);
export const leadSourceEnum = pgEnum("lead_source_enum", ["contact", "newsletter"]);

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    isServiceShowcase: boolean("is_service_showcase").notNull().default(false),
    coverImage: text("cover_image").notNull(),
    logo: text("logo"),
    mediaImage: text("media_image"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("projects_category_idx").on(table.category),
    index("projects_service_showcase_category_idx").on(table.isServiceShowcase, table.category),
  ],
);

export const SYSTEM_CARD_ICONS = [
  "target",
  "search",
  "flask-conical",
  "messages-square",
  "bar-chart-3",
  "workflow",
  "shield",
  "zap",
  "layers",
  "users",
  "compass",
  "bot",
] as const;

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    translationGroupId: uuid("translation_group_id")
      .notNull()
      .default(sql`gen_random_uuid()`),
    language: languageEnum("language").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    coverImage: text("cover_image").notNull(),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    relatedProjectId: integer("related_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    relatedSolution: text("related_solution"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("articles_language_slug_unique").on(table.language, table.slug),
    unique("articles_translation_group_id_language_unique").on(
      table.translationGroupId,
      table.language,
    ),
    index("articles_language_published_published_at_idx").on(
      table.language,
      table.published,
      table.publishedAt.desc(),
    ),
    index("articles_translation_group_id_idx").on(table.translationGroupId),
  ],
);

export const projectTranslations = pgTable(
  "project_translations",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    language: languageEnum("language").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    categoryLabel: text("category_label"),
    clientName: text("client_name"),
    clientSector: text("client_sector"),
    clientCountry: text("client_country"),
    clientModel: text("client_model"),
    problemHeadline: text("problem_headline"),
    problemBody: text("problem_body"),
    diagnosisHeadline: text("diagnosis_headline"),
    diagnosisBody: text("diagnosis_body"),
    systemHeadline: text("system_headline"),
    systemCards: jsonb("system_cards").notNull().default([]),
    results: jsonb("results").notNull().default([]),
    mediaCaption: text("media_caption"),
    ctaHeadline: text("cta_headline"),
    ctaSubtext: text("cta_subtext"),
    tags: jsonb("tags").notNull().default([]),
    technologies: jsonb("technologies").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("project_translations_project_id_language_unique").on(
      table.projectId,
      table.language,
    ),
    index("project_translations_project_id_idx").on(table.projectId),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    service: text("service"),
    message: text("message"),
    source: leadSourceEnum("source").notNull().default("contact"),
    status: leadStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("leads_created_at_idx").on(table.createdAt.desc())],
);

export const images = pgTable("images", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  data: text("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Below this line: generated verbatim by `npx auth generate` (Better Auth
// 1.6.30 CLI) against lib/auth.ts's config. Do not hand-edit — regenerate
// instead if the auth config changes. Only the import statement above was
// consolidated with the application tables' imports; no generated column,
// table, or relation definition was altered. ---

export const auth_user = pgTable("auth_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
});

export const auth_session = pgTable(
  "auth_session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => auth_user.id, { onDelete: "cascade" }),
  },
  (table) => [index("auth_session_userId_idx").on(table.userId)],
);

export const auth_account = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => auth_user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("auth_account_userId_idx").on(table.userId)],
);

export const auth_verification = pgTable(
  "auth_verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("auth_verification_identifier_idx").on(table.identifier)],
);

export const auth_rate_limit = pgTable("auth_rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const auth_userRelations = relations(auth_user, ({ many }) => ({
  auth_sessions: many(auth_session),
  auth_accounts: many(auth_account),
}));

export const auth_sessionRelations = relations(auth_session, ({ one }) => ({
  auth_user: one(auth_user, {
    fields: [auth_session.userId],
    references: [auth_user.id],
  }),
}));

export const auth_accountRelations = relations(auth_account, ({ one }) => ({
  auth_user: one(auth_user, {
    fields: [auth_account.userId],
    references: [auth_user.id],
  }),
}));
