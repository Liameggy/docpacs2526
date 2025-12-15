# Post Board Project Grading Report

## Individual Student Grades

### 1. AndersonDylan

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented with JWT decode |
| 2 | Post CRUD | ✅ PASS | Create, edit, and delete routes implemented with ownership checks |
| 3 | Comment System | ✅ PASS | Comments can be created; post owners and comment owners can delete |
| 4 | User Profiles | ✅ PASS | `/user/:username` route shows all posts by user |
| 5 | Chronological Order | ✅ PASS | Posts DESC, comments ASC |
| 6 | Database Design | ✅ PASS | Three tables (users, posts, comments) with foreign keys |
| 7 | JOIN Queries | ✅ PASS | JOIN statements used to fetch post and comment data |
| 8 | Frontend Rendering | ✅ PASS | EJS properly displays dynamic content |
| 9 | Server Functionality | ✅ PASS | Express routes function correctly |
| 10 | Documentation | ✅ PASS | Complete README.md with installation and usage instructions |

**Errors Found:**

- [Warning] Line 416: Commented out route with syntax error (missing opening parenthesis) - `app.get('sendpogs'),` - but it's commented so not functional

**Score: A**

**Feedback:** Excellent implementation! All requirements met. The code is well-structured with proper authentication checks, ownership validation, and clean database relationships. Consider removing commented-out code before submission.

---

### 2. EgeLiam

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented |
| 2 | Post CRUD | ⚠️ PARTIAL | Create and delete work via socket.io, but no edit functionality |
| 3 | Comment System | ⚠️ PARTIAL | Comments can be created and deleted, but post owners cannot delete comments (only comment authors can) |
| 4 | User Profiles | ❌ FAIL | No user profile route implemented |
| 5 | Chronological Order | ⚠️ PARTIAL | Posts ordered by uid DESC (not timestamp), comments by cid ASC (not timestamp) |
| 6 | Database Design | ❌ FAIL | init.sql only contains users table; missing posts and comments tables |
| 7 | JOIN Queries | ❌ FAIL | No JOIN queries used; uses socket.io instead of REST API |
| 8 | Frontend Rendering | ✅ PASS | EJS properly displays dynamic content |
| 9 | Server Functionality | ⚠️ PARTIAL | Server runs but uses socket.io instead of standard Express routes |
| 10 | Documentation | ❌ FAIL | README.md is empty |

**Errors Found:**

- [Critical Error] init.sql missing posts and comments table definitions - database schema incomplete
- [Serious Error] No user profile route - requirement not met
- [Serious Error] No JOIN queries used - requirement not met
- [Serious Error] Post owners cannot delete comments on their posts - requirement not met
- [Warning] Uses socket.io instead of REST API routes (unconventional but functional)
- [Warning] Chronological ordering uses ID instead of timestamp

**Score: D**

**Feedback:** The project uses an unconventional socket.io approach which works but doesn't meet the requirement for JOIN queries. The database schema is incomplete - you need to add posts and comments tables to init.sql. Add a user profile route that accepts a username parameter. Ensure post owners can delete comments on their posts. Consider using timestamps for chronological ordering instead of IDs.

---

### 3. GarciaDonald

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented |
| 2 | Post CRUD | ✅ PASS | Create, edit, and delete routes implemented |
| 3 | Comment System | ⚠️ PARTIAL | Comments can be created, but ordered DESC instead of ASC; post owners cannot delete comments (anyone can delete any comment) |
| 4 | User Profiles | ✅ PASS | `/profile/:username` route shows all posts by user |
| 5 | Chronological Order | ⚠️ PARTIAL | Posts DESC correct, but comments DESC instead of ASC |
| 6 | Database Design | ⚠️ PARTIAL | Database tables exist but no init.sql file visible in repository |
| 7 | JOIN Queries | ✅ PASS | JOIN statements used to fetch post and comment data |
| 8 | Frontend Rendering | ✅ PASS | EJS properly displays dynamic content |
| 9 | Server Functionality | ⚠️ PARTIAL | Multiple code errors present |
| 10 | Documentation | ✅ PASS | README.md present with instructions |

**Errors Found:**

- [Critical Error] Line 357-368: Comment deletion route has no authorization check - anyone can delete any comment (security vulnerability)
- [Serious Error] Line 103: Comments ordered DESC instead of ASC (requirement not met)
- [Serious Error] Post owners cannot delete comments on their posts (requirement not met)
- [Serious Error] Line 7: Unused `const react = require('react');` import (React is not a Node.js module)
- [Serious Error] Line 22: `process.env.port` should be `process.env.PORT` (capitalized)
- [Serious Error] Line 24: AUTH_URL has `/oauth` appended which may cause incorrect redirect
- [Serious Error] Line 43: Hardcoded redirect URL instead of '/login'
- [Serious Error] Line 166: Template literal issue - missing backticks in console.log
- [Warning] Line 275: Missing semicolon
- [Warning] No init.sql file visible in repository

**Score: D**

**Feedback:** Good structure overall, but there are critical security issues. The comment deletion route allows anyone to delete any comment - you need to add authorization checks to ensure only comment owners or post owners can delete. Fix the chronological ordering for comments (should be ASC, not DESC). Remove the unused React import. Fix the PORT environment variable name. Add proper authorization checks throughout your routes.

---

### 4. KrisBowman

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented via auth.js |
| 2 | Post CRUD | ⚠️ PARTIAL | Create works, but no edit or delete routes |
| 3 | Comment System | ⚠️ PARTIAL | Comments can be created, but no delete functionality |
| 4 | User Profiles | ❌ FAIL | No user profile route implemented |
| 5 | Chronological Order | ⚠️ PARTIAL | Posts ordered by time (not DESC), comments by id (not ASC by timestamp) |
| 6 | Database Design | ❌ FAIL | Comments table missing post_id foreign key - comments not linked to posts |
| 7 | JOIN Queries | ❌ FAIL | No JOIN queries used |
| 8 | Frontend Rendering | ✅ PASS | React properly displays dynamic content |
| 9 | Server Functionality | ⚠️ PARTIAL | Server runs but missing key functionality |
| 10 | Documentation | ❌ FAIL | No README.md file |

**Errors Found:**

- [Critical Error] Comments table missing post_id column - comments cannot be linked to posts (database design broken)
- [Critical Error] No foreign key relationships between tables - database design incomplete
- [Serious Error] No user profile route - requirement not met
- [Serious Error] No JOIN queries used - requirement not met
- [Serious Error] No edit/delete functionality for posts - requirement not met
- [Serious Error] No delete functionality for comments - requirement not met
- [Warning] Posts ordered by time (not DESC), comments by id (not ASC by timestamp)
- [Warning] No README.md file

**Score: F**

**Feedback:** The database schema is fundamentally broken - comments cannot be linked to posts because the comments table is missing a post_id foreign key. You need to redesign your database schema to properly relate comments to posts. Add edit and delete functionality for posts. Implement a user profile route. Use JOIN queries to fetch related data. Add a README.md file with installation and usage instructions.

---

### 5. MarkusOwens

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented |
| 2 | Post CRUD | ⚠️ PARTIAL | Create works, but no edit or delete routes |
| 3 | Comment System | ⚠️ PARTIAL | Comments can be created, but no delete functionality |
| 4 | User Profiles | ⚠️ PARTIAL | `/userprof` route exists but only shows current user's posts, not accepts username parameter |
| 5 | Chronological Order | ✅ PASS | Posts DESC, comments ASC |
| 6 | Database Design | ❌ FAIL | init.sql only contains users table; missing posts and comments tables |
| 7 | JOIN Queries | ✅ PASS | JOIN statements used |
| 8 | Frontend Rendering | ✅ PASS | EJS properly displays dynamic content |
| 9 | Server Functionality | ⚠️ PARTIAL | Multiple code errors present |
| 10 | Documentation | ✅ PASS | README.md present |

**Errors Found:**

- [Critical Error] init.sql missing posts and comments table definitions - database schema incomplete
- [Serious Error] Line 1: Typo "impotr" instead of "import"
- [Serious Error] Line 16: Template literal issue - `${PORT}` won't work in regular string
- [Serious Error] Line 29: Typo "middlewar" instead of "middleware"
- [Serious Error] Line 46: Missing closing parenthesis
- [Serious Error] Line 52, 61, 92, 93, 104, 129, 135, 142: Missing `const`/`let` declarations (variables declared without keywords)
- [Serious Error] Line 84: AUTH_URL has `/oauth` appended which may cause incorrect redirect
- [Serious Error] Line 88: `/allpost` route missing authentication check
- [Serious Error] No edit/delete functionality for posts - requirement not met
- [Serious Error] No delete functionality for comments - requirement not met
- [Serious Error] User profile route doesn't accept username parameter - requirement not met
- [Warning] Comments table structure unclear (no post_uid foreign key visible)

**Score: F**

**Feedback:** The database schema is incomplete - you need to add posts and comments tables to init.sql. There are many syntax errors in your code that need to be fixed (typos, missing variable declarations, template literal issues). Add edit and delete functionality for posts. Implement proper comment deletion. Fix the user profile route to accept a username parameter. Review JavaScript syntax basics - always use `const` or `let` when declaring variables.

---

### 6. MartinChristian

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented |
| 2 | Post CRUD | ✅ PASS | Create, edit, and delete routes implemented |
| 3 | Comment System | ⚠️ PARTIAL | Comments can be created and deleted, but unclear if post owners can delete comments |
| 4 | User Profiles | ✅ PASS | `/profile/:username` route shows all posts by user |
| 5 | Chronological Order | ⚠️ PARTIAL | Need to verify ordering in views |
| 6 | Database Design | ⚠️ PARTIAL | Three tables exist but use username foreign keys instead of user_id (unconventional) |
| 7 | JOIN Queries | ⚠️ PARTIAL | JOIN queries may not be used consistently |
| 8 | Frontend Rendering | ✅ PASS | EJS properly displays dynamic content |
| 9 | Server Functionality | ⚠️ PARTIAL | Uses socket.io for some operations |
| 10 | Documentation | ✅ PASS | README.md present |

**Errors Found:**

- [Serious Error] Database design uses username as foreign key instead of user_id (unconventional and may cause issues)
- [Warning] Uses socket.io for some operations instead of standard REST routes
- [Warning] Need to verify chronological ordering and comment deletion permissions

**Score: C**

**Feedback:** Good overall structure. The database design using username as a foreign key is unconventional - consider using user_id instead for better normalization. Verify that post owners can delete comments on their posts. Ensure chronological ordering is correct (posts DESC, comments ASC). Consider using standard REST API routes instead of socket.io for consistency.

---

### 7. OrtPatrickCarlos

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented |
| 2 | Post CRUD | ✅ PASS | Create, edit, and delete routes implemented |
| 3 | Comment System | ✅ PASS | Comments can be created; post owners and comment owners can delete |
| 4 | User Profiles | ✅ PASS | `/user/:id` route shows all posts by user (uses id instead of username) |
| 5 | Chronological Order | ✅ PASS | Posts DESC, comments ASC |
| 6 | Database Design | ✅ PASS | Three tables (users, posts, comments) with foreign keys |
| 7 | JOIN Queries | ✅ PASS | JOIN statements used to fetch post and comment data |
| 8 | Frontend Rendering | ✅ PASS | EJS properly displays dynamic content |
| 9 | Server Functionality | ✅ PASS | Express routes function correctly |
| 10 | Documentation | ✅ PASS | README.md present |

**Errors Found:**

- [Warning] User profile route uses `/user/:id` instead of `/user/:username` - works but doesn't match requirement exactly (should accept username)

**Score: A**

**Feedback:** Excellent implementation! All requirements met. The code is well-structured. Consider updating the user profile route to accept username instead of id to match the requirement more closely, though the current implementation is functional.

---

### 8. PittmanAaJah

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented |
| 2 | Post CRUD | ✅ PASS | Create, edit, and delete routes implemented |
| 3 | Comment System | ✅ PASS | Comments can be created; post owners can delete comments |
| 4 | User Profiles | ❌ FAIL | No user profile route implemented |
| 5 | Chronological Order | ✅ PASS | Posts DESC, comments ASC |
| 6 | Database Design | ❌ FAIL | init.sql only contains users table; missing posts and comments tables |
| 7 | JOIN Queries | ✅ PASS | JOIN statements used to fetch post and comment data |
| 8 | Frontend Rendering | ✅ PASS | EJS properly displays dynamic content |
| 9 | Server Functionality | ✅ PASS | Express routes function correctly |
| 10 | Documentation | ❌ FAIL | No README.md file |

**Errors Found:**

- [Critical Error] init.sql missing posts and comments table definitions - database schema incomplete
- [Serious Error] No user profile route - requirement not met
- [Serious Error] Line 20: Template literal issue - `${port}` won't work in regular string (has space before backtick)
- [Warning] No README.md file

**Score: D**

**Feedback:** Good implementation of core functionality, but the database schema is incomplete. You need to add posts and comments tables to init.sql. Add a user profile route that accepts a username parameter and shows all posts by that user. Fix the template literal on line 20. Add a README.md file with installation and usage instructions.

---

### 9. ReschStephen

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented |
| 2 | Post CRUD | ✅ PASS | Create, edit, and delete routes implemented |
| 3 | Comment System | ✅ PASS | Comments can be created; post owners can delete comments |
| 4 | User Profiles | ✅ PASS | `/user/:username/posts` route shows all posts by user |
| 5 | Chronological Order | ✅ PASS | Posts DESC, comments ASC |
| 6 | Database Design | ❌ FAIL | init.sql only contains users table; missing posts and comments tables |
| 7 | JOIN Queries | ❌ FAIL | No JOIN queries used; queries posts and comments separately |
| 8 | Frontend Rendering | ✅ PASS | EJS properly displays dynamic content |
| 9 | Server Functionality | ✅ PASS | Express routes function correctly |
| 10 | Documentation | ✅ PASS | README.md present |

**Errors Found:**

- [Critical Error] init.sql missing posts and comments table definitions - database schema incomplete
- [Serious Error] No JOIN queries used - requirement not met (queries posts and comments separately)
- [Warning] Line 90: Function named `z` instead of meaningful name

**Score: D**

**Feedback:** Good implementation of functionality, but the database schema is incomplete. You need to add posts and comments tables to init.sql. Use JOIN queries to efficiently fetch posts with their related comments in a single query instead of querying them separately. Consider using more descriptive function names.

---

### 10. WellsLynn

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Login System | ✅ PASS | Formbar OAuth implemented |
| 2 | Post CRUD | ✅ PASS | Create, edit, and delete routes implemented |
| 3 | Comment System | ⚠️ PARTIAL | Comments can be created and deleted, but unclear if post owners can delete comments (code comment says not implemented) |
| 4 | User Profiles | ❌ FAIL | No user profile route implemented |
| 5 | Chronological Order | ✅ PASS | Posts DESC, comments ASC |
| 6 | Database Design | ✅ PASS | Three tables (users, posts, comments) with foreign keys |
| 7 | JOIN Queries | ✅ PASS | JOIN statements used to fetch post and comment data |
| 8 | Frontend Rendering | ✅ PASS | EJS properly displays dynamic content |
| 9 | Server Functionality | ✅ PASS | Express routes function correctly |
| 10 | Documentation | ✅ PASS | README.md present (commented requirements checklist) |

**Errors Found:**

- [Serious Error] No user profile route - requirement not met
- [Warning] Code comment indicates post owners cannot delete comments (requirement not fully met)
- [Warning] Database tables created in app.js instead of init.sql (unconventional but functional)

**Score: C**

**Feedback:** Good implementation overall. Add a user profile route that accepts a username parameter and shows all posts by that user. Ensure post owners can delete comments on their posts (the code comment suggests this isn't implemented). Consider moving table creation to init.sql for better organization.

---

## Summary

- **A Grades:** 2 students (AndersonDylan, OrtPatrickCarlos)
- **C Grades:** 2 students (MartinChristian, WellsLynn)
- **D Grades:** 4 students (EgeLiam, GarciaDonald, PittmanAaJah, ReschStephen)
- **F Grades:** 2 students (KrisBowman, MarkusOwens)

### Common Issues Across Projects:

1. **Incomplete Database Schemas:** Several projects have init.sql files that only contain the users table, missing posts and comments tables.
2. **Missing User Profile Routes:** Many projects lack routes that accept a username parameter to show all posts by that user.
3. **Comment Deletion Permissions:** Several projects don't properly implement the requirement that post owners can delete comments on their posts.
4. **JOIN Queries:** Some projects query posts and comments separately instead of using JOIN queries.
5. **Chronological Ordering:** Some projects order by ID instead of timestamp, or have incorrect ordering (comments DESC instead of ASC).

