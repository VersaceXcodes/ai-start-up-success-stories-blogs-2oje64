-- DROP TABLES IN THE REVERSE ORDER OF DEPENDENCIES (FOR A CLEAN INSTALL)
DROP TABLE IF EXISTS newsletter_subscriptions;
DROP TABLE IF EXISTS blog_post_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS users;

-- CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id              TEXT        NOT NULL PRIMARY KEY,
    username        TEXT        NOT NULL UNIQUE,
    email           TEXT        NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    role            TEXT        NOT NULL DEFAULT 'admin',
    created_at      TEXT        NOT NULL,
    updated_at      TEXT        NOT NULL
);

-- CREATE BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
    id                 TEXT        NOT NULL PRIMARY KEY,
    title              TEXT        NOT NULL,
    excerpt            TEXT        NOT NULL,
    body_content       TEXT        NOT NULL,
    featured_image_url TEXT,
    publication_date   TEXT        NOT NULL,
    status             TEXT        NOT NULL,
    admin_user_id      TEXT        NOT NULL,
    created_at         TEXT        NOT NULL,
    updated_at         TEXT        NOT NULL,
    is_deleted         BOOLEAN     NOT NULL DEFAULT false,
    CONSTRAINT fk_admin_user
        FOREIGN KEY(admin_user_id)
            REFERENCES users(id)
);

-- CREATE TAGS TABLE
CREATE TABLE IF NOT EXISTS tags (
    id        TEXT    NOT NULL PRIMARY KEY,
    tag_name  TEXT    NOT NULL UNIQUE,
    tag_type  TEXT
);

-- CREATE BLOG POST TAGS TABLE (JOIN TABLE)
CREATE TABLE IF NOT EXISTS blog_post_tags (
    id            TEXT    NOT NULL PRIMARY KEY,
    blog_post_id  TEXT    NOT NULL,
    tag_id        TEXT    NOT NULL,
    CONSTRAINT fk_blog_post
        FOREIGN KEY(blog_post_id)
            REFERENCES blog_posts(id),
    CONSTRAINT fk_tag
        FOREIGN KEY(tag_id)
            REFERENCES tags(id)
);

-- CREATE NEWSLETTER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id                 TEXT    NOT NULL PRIMARY KEY,
    email              TEXT    NOT NULL UNIQUE,
    subscription_date  TEXT    NOT NULL
);

-- SEED DATA FOR USERS TABLE
INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at) VALUES
    ('user1', 'admin',  'admin@example.com',  'hashed_password_admin', 'admin', '2023-01-01 10:00:00', '2023-01-01 10:00:00'),
    ('user2', 'editor', 'editor@example.com', 'hashed_password_editor', 'admin', '2023-02-15 11:30:00', '2023-02-15 11:30:00');

-- SEED DATA FOR BLOG_POSTS TABLE
INSERT INTO blog_posts (id, title, excerpt, body_content, featured_image_url, publication_date, status, admin_user_id, created_at, updated_at, is_deleted) VALUES
    (
        'post1',
        'How AI Changed My Startup',
        'A revolutionary journey powered by AI in transforming startups.',
        'This post details the full story of how AI revolutionized the startup landscape with innovative strategies and technologies.',
        'https://picsum.photos/seed/post1/600/400',
        '2023-05-20 09:00:00',
        'published',
        'user1',
        '2023-05-01 08:00:00',
        '2023-05-20 09:00:00',
        false
    ),
    (
        'post2',
        'Scaling Up with Smart Automation',
        'Automation tips for growing businesses.',
        'An in-depth look at how smart automation can assist startups in scaling operations efficiently and effectively.',
        'https://picsum.photos/seed/post2/600/400',
        '2023-06-15 10:30:00',
        'published',
        'user2',
        '2023-06-01 07:45:00',
        '2023-06-15 10:30:00',
        false
    ),
    (
        'post3',
        'Innovative Financing Strategies',
        'Exploring non-traditional ways to secure startup funding.',
        'An investigative article discussing innovative financing avenues available to startups beyond conventional venture capital.',
        'https://picsum.photos/seed/post3/600/400',
        '2023-07-01 11:00:00',
        'draft',
        'user1',
        '2023-06-25 09:15:00',
        '2023-06-25 09:15:00',
        false
    );

-- SEED DATA FOR TAGS TABLE
INSERT INTO tags (id, tag_name, tag_type) VALUES
    ('tag1', 'AI', 'category'),
    ('tag2', 'Automation', 'category'),
    ('tag3', 'Financing', 'tag'),
    ('tag4', 'Startup', 'tag'),
    ('tag5', 'Tech', 'tag');

-- SEED DATA FOR BLOG_POST_TAGS TABLE
INSERT INTO blog_post_tags (id, blog_post_id, tag_id) VALUES
    ('bpt1', 'post1', 'tag1'),  -- Post1 tagged with AI
    ('bpt2', 'post1', 'tag4'),  -- Post1 tagged with Startup
    ('bpt3', 'post2', 'tag2'),  -- Post2 tagged with Automation
    ('bpt4', 'post2', 'tag5'),  -- Post2 tagged with Tech
    ('bpt5', 'post3', 'tag3'),  -- Post3 tagged with Financing
    ('bpt6', 'post3', 'tag4'),  -- Post3 tagged with Startup
    ('bpt7', 'post3', 'tag5');  -- Post3 tagged with Tech

-- SEED DATA FOR NEWSLETTER_SUBSCRIPTIONS TABLE
INSERT INTO newsletter_subscriptions (id, email, subscription_date) VALUES
    ('nsub1', 'subscriber1@example.com', '2023-07-10 14:00:00'),
    ('nsub2', 'subscriber2@example.com', '2023-07-11 15:30:00'),
    ('nsub3', 'subscriber3@example.com', '2023-07-12 16:45:00');