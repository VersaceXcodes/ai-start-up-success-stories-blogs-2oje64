// server.mjs
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const {
  DATABASE_URL,
  PGHOST,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  PGPORT = 5432,
  PORT = 3000,
  JWT_SECRET = 'your_jwt_secret'
} = process.env;

// Initialize Postgres pool following the provided snippet:
const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { require: true } 
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { require: true },
      }
);

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app and middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // logs method, URL, status and response time

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});

// Utility function to format dates as "YYYY-MM-DD HH:MM:SS"
function formatTimestamp(date) {
  const pad = (n) => n < 10 ? '0' + n : n;
  return date.getFullYear() + '-' +
         pad(date.getMonth() + 1) + '-' +
         pad(date.getDate()) + ' ' +
         pad(date.getHours()) + ':' +
         pad(date.getMinutes()) + ':' +
         pad(date.getSeconds());
}
// Middleware to verify JWT tokens on protected routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: "Token is not valid" });
    req.user = user;
    next();
  });
}

/*
  POST /api/auth/login
  Authenticate admin users by verifying provided credentials.
*/
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    // Query database for the user with the specified username
    const userQuery = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userQuery.rowCount === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const user = userQuery.rows[0];

    // For demonstration purposes, we simply match the provided password with the stored password_hash.
    // In a production app, use a proper hashing algorithm like bcrypt.
    if (password !== user.password_hash) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    return res.status(200).json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/*
  GET /api/blog_posts
  Retrieve a paginated list of blog posts with optional search keyword and tag filtering.
*/
app.get('/api/blog_posts', async (req, res) => {
  try {
    const { search, tags, page } = req.query;
    const pageSize = 10;
    const pageNumber = page ? parseInt(page) : 1;
    const offset = (pageNumber - 1) * pageSize;

    // Build dynamic SQL query
    let conditions = ["bp.is_deleted = false"];
    let queryParams = [];
    
    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(bp.title ILIKE $${queryParams.length} OR bp.excerpt ILIKE $${queryParams.length})`);
    }
    if (tags) {
      const tagArray = tags.split(",");
      queryParams.push(tagArray);
      conditions.push(`bp.id IN (SELECT blog_post_id FROM blog_post_tags WHERE tag_id = ANY($${queryParams.length}))`);
    }

    const baseQuery = `
      SELECT bp.*, 
             COALESCE(array_agg(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags
      FROM blog_posts bp
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.blog_post_id
      LEFT JOIN tags t ON bpt.tag_id = t.id
      WHERE ${conditions.join(" AND ")}
      GROUP BY bp.id
      ORDER BY bp.publication_date DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    queryParams.push(pageSize, offset);

    const result = await pool.query(baseQuery, queryParams);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/*
  GET /api/blog_posts/:id
  Retrieve the full details of a specific blog post including its tags.
*/
app.get('/api/blog_posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = `
      SELECT bp.*,
             COALESCE(array_agg(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags
      FROM blog_posts bp
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.blog_post_id
      LEFT JOIN tags t ON bpt.tag_id = t.id
      WHERE bp.id = $1 AND bp.is_deleted = false
      GROUP BY bp.id
    `;
    const result = await pool.query(queryText, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching blog post detail:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/*
  POST /api/blog_posts
  Create a new blog post (Admin only). Generates a unique ID and timestamps.
  Also handles tag associations in the join table.
*/
app.post('/api/blog_posts', authenticateToken, async (req, res) => {
  try {
    const { title, excerpt, body_content, featured_image_url, publication_date, status, tags } = req.body;
    if (!title || !excerpt || !body_content || !publication_date || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate a unique ID and set timestamps
    const postId = randomUUID();
    const timestamp = formatTimestamp(new Date());
    const admin_user_id = req.user.id;

    // Insert new blog post record into the database.
    const insertQuery = `
      INSERT INTO blog_posts 
        (id, title, excerpt, body_content, featured_image_url, publication_date, status, admin_user_id, created_at, updated_at, is_deleted)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, false)
    `;
    await pool.query(insertQuery, [
      postId,
      title,
      excerpt,
      body_content,
      featured_image_url || null,
      publication_date,
      status,
      admin_user_id,
      timestamp
    ]);

    // Insert tag associations if provided
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        const blogPostTagId = randomUUID();
        const insertTagQuery = `
          INSERT INTO blog_post_tags (id, blog_post_id, tag_id)
          VALUES ($1, $2, $3)
        `;
        await pool.query(insertTagQuery, [blogPostTagId, postId, tagId]);
      }
    }
    
    // Fetch the newly created blog post with associated tags to return in response.
    const detailQuery = `
      SELECT bp.*,
             COALESCE(array_agg(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags
      FROM blog_posts bp
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.blog_post_id
      LEFT JOIN tags t ON bpt.tag_id = t.id
      WHERE bp.id = $1
      GROUP BY bp.id
    `;
    const detailResult = await pool.query(detailQuery, [postId]);
    return res.status(201).json(detailResult.rows[0]);
  } catch (error) {
    console.error("Error creating blog post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/*
  PUT /api/blog_posts/:id
  Update an existing blog post (Admin only). This includes updating the main content as well as tag associations.
*/
app.put('/api/blog_posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, body_content, featured_image_url, publication_date, status, tags } = req.body;
    if (!title || !excerpt || !body_content || !publication_date || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const timestamp = formatTimestamp(new Date());

    // Update the blog post in the database.
    const updateQuery = `
      UPDATE blog_posts 
      SET title = $1, excerpt = $2, body_content = $3,
          featured_image_url = $4, publication_date = $5,
          status = $6, updated_at = $7
      WHERE id = $8 AND is_deleted = false
    `;
    const updateResult = await pool.query(updateQuery, [
      title, excerpt, body_content, featured_image_url || null, publication_date, status, timestamp, id
    ]);
    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    
    // Update tag associations: remove existing then insert new ones if provided.
    if (tags && Array.isArray(tags)) {
      // Remove old tag associations.
      await pool.query("DELETE FROM blog_post_tags WHERE blog_post_id = $1", [id]);
      // Insert new tag associations.
      for (const tagId of tags) {
        const blogPostTagId = randomUUID();
        await pool.query(
          "INSERT INTO blog_post_tags (id, blog_post_id, tag_id) VALUES ($1, $2, $3)",
          [blogPostTagId, id, tagId]
        );
      }
    }
    
    // Retrieve updated blog post details.
    const detailQuery = `
      SELECT bp.*,
             COALESCE(array_agg(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags
      FROM blog_posts bp
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.blog_post_id
      LEFT JOIN tags t ON bpt.tag_id = t.id
      WHERE bp.id = $1
      GROUP BY bp.id
    `;
    const detailResult = await pool.query(detailQuery, [id]);
    return res.status(200).json(detailResult.rows[0]);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/*
  DELETE /api/blog_posts/:id
  Soft delete a blog post (Admin only) by marking it as deleted.
*/
app.delete('/api/blog_posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const timestamp = formatTimestamp(new Date());
    const deleteQuery = `
      UPDATE blog_posts
      SET is_deleted = true, updated_at = $1
      WHERE id = $2 AND is_deleted = false
    `;
    const result = await pool.query(deleteQuery, [timestamp, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    return res.status(200).json({
      message: "Blog post deleted successfully",
      id,
      is_deleted: true
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/*
  POST /api/newsletter_subscriptions
  Subscribe a visitor to the newsletter by saving their email.
*/
app.post('/api/newsletter_subscriptions', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const subscriptionId = randomUUID();
    const subscription_date = formatTimestamp(new Date());
    
    const insertQuery = `
      INSERT INTO newsletter_subscriptions (id, email, subscription_date)
      VALUES ($1, $2, $3)
    `;
    await pool.query(insertQuery, [subscriptionId, email, subscription_date]);
    
    return res.status(201).json({
      id: subscriptionId,
      email,
      subscription_date
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/*
  GET /api/tags
  Retrieve a list of available tags for filtering purposes.
*/
app.get('/api/tags', async (req, res) => {
  try {
    const tagQuery = `
      SELECT * FROM tags
      ORDER BY tag_name
    `;
    const result = await pool.query(tagQuery);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});