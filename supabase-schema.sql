-- CourseBot Database Schema for Supabase
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)

-- 1. Courses table
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Queries table (student chat logs)
CREATE TABLE IF NOT EXISTS queries (
  id BIGSERIAL PRIMARY KEY,
  student TEXT NOT NULL DEFAULT 'Anonymous',
  question TEXT NOT NULL,
  answer TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS (Row Level Security) but allow all access via service key
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for authenticated and anonymous users
-- (Since we use the service key in Netlify Functions, this is fine)
CREATE POLICY "Allow all access to courses" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all access to queries" ON queries FOR ALL USING (true);

-- 4. Seed some sample courses
INSERT INTO courses (name, description, category) VALUES
  ('React Masterclass', 'Complete guide to React.js including hooks, context, and Redux. Build real-world projects from scratch.', 'Frontend Development'),
  ('HTML & CSS Fundamentals', 'Learn the building blocks of the web. Master semantic HTML, CSS Grid, Flexbox, and responsive design.', 'Frontend Development'),
  ('Vue.js Bootcamp', 'Fast-track your Vue.js skills with Composition API, Pinia state management, and Vue Router.', 'Frontend Development'),
  ('Next.js Full Stack', 'Build production-ready applications with Next.js, server-side rendering, and API routes.', 'Frontend Development'),
  ('Node.js API Mastery', 'Build scalable RESTful APIs and microservices with Node.js and Express.js.', 'Backend Development'),
  ('Python for Backend', 'Create powerful backends with Python, Flask, and FastAPI. Includes authentication and database integration.', 'Backend Development'),
  ('Spring Boot in Practice', 'Enterprise Java development with Spring Boot, Spring Security, and microservices architecture.', 'Backend Development'),
  ('SQL & Database Design', 'Master SQL queries, database design, normalization, and performance optimization.', 'Databases'),
  ('MongoDB Essentials', 'Learn NoSQL with MongoDB. Document modeling, aggregation pipelines, and real-time data.', 'Databases'),
  ('Machine Learning with Python', 'From linear regression to neural networks. Hands-on ML with scikit-learn, TensorFlow, and Keras.', 'Data Science & AI'),
  ('Data Science Bootcamp', 'Complete data science pipeline: data cleaning, visualization, statistical analysis, and predictive modeling.', 'Data Science & AI'),
  ('Flutter Mobile Development', 'Build beautiful cross-platform mobile apps with Flutter and Dart. iOS and Android from a single codebase.', 'Mobile Development'),
  ('React Native Zero to Hero', 'Create native mobile apps with React Native. Navigation, state management, and native modules.', 'Mobile Development'),
  ('AWS Cloud Practitioner', 'Master AWS services: EC2, S3, Lambda, RDS, and more. Prepare for the AWS certification.', 'DevOps & Cloud'),
  ('Docker & Kubernetes', 'Container orchestration from development to production. Docker Compose, K8s deployments, and scaling.', 'DevOps & Cloud'),
  ('Ethical Hacking & Security', 'Learn penetration testing, vulnerability assessment, and network security best practices.', 'Cybersecurity'),
  ('Cybersecurity Fundamentals', 'Build a solid foundation in cybersecurity: threats, defenses, encryption, and incident response.', 'Cybersecurity'),
  ('TypeScript Deep Dive', 'Master TypeScript with advanced types, generics, decorators, and integration with React and Node.js.', 'Frontend Development'),
  ('GraphQL Complete Guide', 'Design and build GraphQL APIs with Apollo Server and client. Subscriptions, caching, and federation.', 'Backend Development'),
  ('AI & Deep Learning', 'Neural networks, CNNs, RNNs, and transformers. Build AI models from the ground up with PyTorch.', 'Data Science & AI')
ON CONFLICT DO NOTHING;
