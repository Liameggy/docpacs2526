# EJS Partials Assignment - Grading Report

## Error Categories
- **Critical Error**: Causes crash during normal operation or prevents core functionality (-3 letter grades each)
- **Serious Error**: Major requirement not met or significant code issues (-1 letter grade each)
- **Warning**: Code style or convention issues (noted but no grade penalty)

---

## Individual Student Grades

### 1. AndersonDylan

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | Express and EJS properly configured |
| 2 | views/partials folder exists | ✅ PASS | Proper folder structure |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ✅ PASS | Includes DOCTYPE, html, head with CSS |
| 4 | foot.ejs contains correct closing HTML structure | ✅ PASS | Contains `</html>` |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ✅ PASS | Partials included properly |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ✅ PASS | Uses ejs.renderFile with callback |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ✅ PASS | Saves to index.html |
| 10 | /print responds to the user with success/failure message | ❌ FAIL | No response sent to browser |
| 11 | The generated index.html contains no Print button | ✅ PASS | viewport: "offline" prevents button |
| 12 | All code runs without crashing | ❌ FAIL | /print route never responds, causing hang |

**Errors Found:**
- [Critical Error] Lines 14-26: The `/print` route never sends a response to the client. After writing the file, there's no `res.send()`, causing the browser request to hang indefinitely until timeout.

**Recommendations:**
- Add `res.send('File saved successfully as index.html')` after the fs.writeFile success (inside the callback).
- Also add error handling with `res.send()` in the error cases.

**Score: C** (Starting A, -3 for critical error, -1 for rubric #10 not met)

---

### 2. BowmanKris

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | EJS configured correctly |
| 2 | views/partials folder exists | ✅ PASS | Proper folder structure |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ❌ FAIL | Missing DOCTYPE and `<html>` opening tag |
| 4 | foot.ejs contains correct closing HTML structure | ✅ PASS | Contains `</html>` |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ✅ PASS | Partials included properly |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ✅ PASS | Uses res.render with callback |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ✅ PASS | Saves to index.html |
| 10 | /print responds to the user with success/failure message | ✅ PASS | Proper success/error messages |
| 11 | The generated index.html contains no Print button | ✅ PASS | viewport: "offline" prevents button |
| 12 | All code runs without crashing | ✅ PASS | Code runs successfully |

**Errors Found:**
- [Serious Error] Lines 1-7 (head.ejs): Missing `<!DOCTYPE html>` and `<html lang="en">` opening tag. The partial starts directly with `<head>`, which violates the assignment requirement for "the first half of an HTML page."

**Recommendations:**
- Add `<!DOCTYPE html>` and `<html lang="en">` at the beginning of head.ejs.
- The head.ejs file should contain everything from the DOCTYPE through the closing `</head>` tag, but stop before `<body>`.

**Score: B+** (Starting A, -1 for rubric #3 not met, -1 for serious error)

---

### 3. EgeLiam

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | EJS configured correctly |
| 2 | views/partials folder exists | ✅ PASS | Proper folder structure |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ✅ PASS | Correct structure |
| 4 | foot.ejs contains correct closing HTML structure | ✅ PASS | Contains `</html>` |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ✅ PASS | Partials included properly |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ❌ FAIL | Renders 'print' template instead of 'index' |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ❌ FAIL | Writes "hi" instead of rendered HTML |
| 10 | /print responds to the user with success/failure message | ⚠️ PARTIAL | Sends message but functionality is broken |
| 11 | The generated index.html contains no Print button | ❌ FAIL | File contains "hi", not valid HTML |
| 12 | All code runs without crashing | ❌ FAIL | Generates invalid output |

**Errors Found:**
- [Critical Error] Line 14: `/print` route tries to render template named 'print' instead of 'index'. The 'print' template doesn't exist in views folder.
- [Critical Error] Line 19: Writes the variable `info` (which contains "hi") to the file instead of the rendered HTML from the callback parameter `html`. The rendered HTML is completely ignored.

**Recommendations:**
- Change line 14 from `res.render('print', ...)` to `res.render('index', ...)`.
- Change line 19 from `fs.writeFile(outputPath, info, ...)` to `fs.writeFile(outputPath, html, ...)` - use the `html` parameter from the callback.
- Remove the unused `info` variable (line 7).

**Score: F** (Starting A, -6 for two critical errors, -2 for rubric #8 and #9 not met)

---

### 4. GarciaDonald

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | EJS configured correctly |
| 2 | views/partials folder exists | ✅ PASS | Proper folder structure |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ❌ FAIL | Missing DOCTYPE and `<html>` opening tag |
| 4 | foot.ejs contains correct closing HTML structure | ✅ PASS | Contains `</html>` |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ✅ PASS | Partials included properly |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ✅ PASS | Uses res.render with callback |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ✅ PASS | Saves to index.html |
| 10 | /print responds to the user with success/failure message | ✅ PASS | Proper success/error messages |
| 11 | The generated index.html contains no Print button | ✅ PASS | viewport: "print" (not "online") prevents button |
| 12 | All code runs without crashing | ✅ PASS | Code runs successfully |

**Errors Found:**
- [Serious Error] Lines 1-7 (head.ejs): Missing `<!DOCTYPE html>` and `<html lang="en">` opening tag. The partial starts directly with `<head>`.

**Warnings:**
- Line 24: Uses `viewport: 'print'` instead of the specified `viewport: 'offline'`. While this still works (button won't show), it doesn't follow the assignment specification.

**Recommendations:**
- Add `<!DOCTYPE html>` and `<html lang="en">` at the beginning of head.ejs.
- Change `viewport: 'print'` to `viewport: 'offline'` to match assignment requirements.

**Score: B+** (Starting A, -1 for rubric #3 not met, -1 for serious error)

---

### 5. MechlerDylan

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | EJS configured correctly |
| 2 | views/partials folder exists | ✅ PASS | Proper folder structure |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ✅ PASS | Excellent CSS styling included |
| 4 | foot.ejs contains correct closing HTML structure | ✅ PASS | Contains `</html>` |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ✅ PASS | Partials included properly |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ✅ PASS | Uses ejs.renderFile |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ❌ FAIL | Saves to wrong location (views/ instead of root) |
| 10 | /print responds to the user with success/failure message | ✅ PASS | Sends "File Saved" message |
| 11 | The generated index.html contains no Print button | ✅ PASS | viewport: "offline" prevents button |
| 12 | All code runs without crashing | ✅ PASS | Code runs successfully |

**Errors Found:**
- [Serious Error] Line 20: Saves file to `'views/index.html'` instead of `'index.html'` in the project root directory as required by the assignment.

**Recommendations:**
- Change line 20 from `fs.writeFile('views/index.html', ...)` to `fs.writeFile('index.html', ...)`.
- Great job on the creative click counter game and excellent CSS animations!

**Score: B+** (Starting A, -1 for rubric #9 not met, -1 for serious error)

---

### 6. OrtPatrickCarlos

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | EJS configured correctly |
| 2 | views/partials folder exists | ✅ PASS | Proper folder structure |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ❌ FAIL | Missing DOCTYPE and `<html>` opening tag |
| 4 | foot.ejs contains correct closing HTML structure | ✅ PASS | Contains `</html>` |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ✅ PASS | Partials included properly |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ✅ PASS | Uses ejs.renderFile |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ✅ PASS | Saves to index.html |
| 10 | /print responds to the user with success/failure message | ✅ PASS | Proper success/error messages |
| 11 | The generated index.html contains no Print button | ✅ PASS | viewport: "offline" prevents button |
| 12 | All code runs without crashing | ✅ PASS | Code runs successfully |

**Errors Found:**
- [Serious Error] Lines 1-18 (head.ejs): Missing `<!DOCTYPE html>` and `<html lang="en">` opening tag. The partial starts directly with `<head>` and ends with `</head>`.

**Recommendations:**
- Add `<!DOCTYPE html>` and `<html lang="en">` at the beginning of head.ejs before the `<head>` tag.

**Score: B+** (Starting A, -1 for rubric #3 not met, -1 for serious error)

---

### 7. OwensMarkus

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | EJS configured correctly |
| 2 | views/partials folder exists | ⚠️ WARNING | Folder named "Partials" (capital P) instead of lowercase |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ❌ FAIL | Missing DOCTYPE and `<html>` opening tag |
| 4 | foot.ejs contains correct closing HTML structure | ✅ PASS | Contains `</html>` |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ✅ PASS | Partials included (with capital P) |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ❌ FAIL | Writes hardcoded HTML string, doesn't render template |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ❌ FAIL | Saves hardcoded string instead of rendered EJS |
| 10 | /print responds to the user with success/failure message | ⚠️ PARTIAL | Renders index with message, but won't execute due to syntax error |
| 11 | The generated index.html contains no Print button | ❌ FAIL | Hardcoded HTML, not from template rendering |
| 12 | All code runs without crashing | ❌ FAIL | Syntax error will crash the server |

**Errors Found:**
- [Critical Error] Lines 71-79: The `/print` route writes a hardcoded HTML string (`indexhtml` variable) instead of rendering the actual index.ejs template with EJS. This completely bypasses the templating system.
- [Critical Error] Line 85: Standalone `else` statement without proper if/else structure - missing opening brace. This is a syntax error that will cause the server to crash on startup.
- [Serious Error] Lines 1-16 (head.ejs): Missing `<!DOCTYPE html>` and `<html>` opening tag.

**Recommendations:**
- Replace lines 71-89 with proper EJS rendering: Use `ejs.renderFile('views/index.ejs', { viewport: 'offline' }, ...)` to render the template.
- Fix the syntax error on line 85: The fs.writeFile callback structure is malformed. Properly structure the if/else blocks.
- Add `<!DOCTYPE html>` and `<html lang="en">` to head.ejs.
- This project included features beyond the assignment scope (authentication, database, sessions), which is ambitious but ensure the basic requirements are met first.

**Score: F** (Starting A, -6 for two critical errors, -1 for serious error, -3 for rubric #3, #8, #9 not met)

---

### 8. PittmanAaJah

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | EJS configured correctly |
| 2 | views/partials folder exists | ✅ PASS | Proper folder structure |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ❌ FAIL | Missing DOCTYPE and `<html>` opening tag |
| 4 | foot.ejs contains correct closing HTML structure | ✅ PASS | Contains `</html>` |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ✅ PASS | Partials included properly |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ✅ PASS | Uses ejs.renderFile |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ✅ PASS | Saves to index.html |
| 10 | /print responds to the user with success/failure message | ❌ FAIL | Empty res.send() - no message |
| 11 | The generated index.html contains no Print button | ✅ PASS | viewport: "offline" prevents button |
| 12 | All code runs without crashing | ✅ PASS | Code runs successfully |

**Errors Found:**
- [Serious Error] Lines 1-7 (head.ejs): Missing `<!DOCTYPE html>` and `<html lang="en">` opening tag.
- [Serious Error] Lines 22 and 25: Calls `res.send()` with no arguments. While this doesn't crash, it doesn't meet the requirement to tell the user whether the file save was successful or failed.

**Recommendations:**
- Add `<!DOCTYPE html>` and `<html lang="en">` at the beginning of head.ejs.
- Change `res.send()` to `res.send('Error writing file')` on line 22 and `res.send('HTML file has been generated successfully.')` on line 25.

**Score: B** (Starting A, -1 for rubric #3 not met, -2 for two serious errors)

---

### 9. ReschStephen

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | EJS configured correctly |
| 2 | views/partials folder exists | ✅ PASS | Proper folder structure |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ✅ PASS | Includes DOCTYPE, html, head with CSS |
| 4 | foot.ejs contains correct closing HTML structure | ✅ PASS | Contains `</html>` |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ✅ PASS | Partials included properly |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ✅ PASS | Uses ejs.renderFile |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ❌ FAIL | Saves to wrong location (views/ instead of root) |
| 10 | /print responds to the user with success/failure message | ✅ PASS | Proper success/error messages |
| 11 | The generated index.html contains no Print button | ✅ PASS | viewport: "offline" prevents button |
| 12 | All code runs without crashing | ✅ PASS | Code runs successfully |

**Errors Found:**
- [Serious Error] Line 20: Saves file to `'views/index.html'` instead of `'index.html'` in the project root directory as required by the assignment.

**Recommendations:**
- Change line 20 from `fs.writeFile('views/index.html', ...)` to `fs.writeFile('index.html', ...)`.
- Otherwise excellent work with proper error handling and clean code structure!

**Score: B+** (Starting A, -1 for rubric #9 not met, -1 for serious error)

---

### 10. WellsLynn

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | EJS is installed and configured as the view engine | ✅ PASS | EJS configured correctly |
| 2 | views/partials folder exists | ✅ PASS | Proper folder structure |
| 3 | head.ejs includes correct HTML structure up to (but not including) `<body>` | ❌ FAIL | File named 'header.ejs' instead of 'head.ejs' |
| 4 | foot.ejs contains correct closing HTML structure | ❌ FAIL | File named 'footer.ejs' instead of 'foot.ejs' |
| 5 | index.ejs includes head.ejs and foot.ejs partials in correct locations | ⚠️ PARTIAL | Includes partials, but with wrong names |
| 6 | index.ejs shows a Print button only if viewport === "online" | ✅ PASS | Conditional rendering correct |
| 7 | / endpoint renders index.ejs with viewport: "online" | ✅ PASS | Route implemented correctly |
| 8 | /print endpoint renders (not directly to browser) | ✅ PASS | Uses ejs.renderFile |
| 9 | /print saves the EJS to a string in an "index.html" file using fs | ✅ PASS | Saves to index.html |
| 10 | /print responds to the user with success/failure message | ✅ PASS | Proper success/error messages |
| 11 | The generated index.html contains no Print button | ✅ PASS | viewport: "offline" prevents button |
| 12 | All code runs without crashing | ✅ PASS | Code runs successfully |

**Errors Found:**
- [Serious Error] Partial files named 'header.ejs' and 'footer.ejs' instead of the required 'head.ejs' and 'foot.ejs'. While the functionality is correct, this doesn't follow the assignment specifications which explicitly state the file names.

**Recommendations:**
- Rename 'header.ejs' to 'head.ejs' and 'footer.ejs' to 'foot.ejs' as specified in the assignment.
- Update the include statements in index.ejs to use the correct filenames: `include('partials/head')` and `include('partials/foot')`.
- Otherwise, clean code with good structure and proper HTML!

**Score: B+** (Starting A, -1 for rubric #3 and #4 not met, -1 for serious error)

---

## Summary Statistics

| Student | Grade | Rubric Items Passed | Critical Errors | Serious Errors |
|---------|-------|---------------------|-----------------|----------------|
| AndersonDylan | C | 10/12 | 1 | 0 |
| BowmanKris | B+ | 11/12 | 0 | 1 |
| EgeLiam | F | 7/12 | 2 | 0 |
| GarciaDonald | B+ | 11/12 | 0 | 1 |
| MechlerDylan | B+ | 11/12 | 0 | 1 |
| OrtPatrickCarlos | B+ | 11/12 | 0 | 1 |
| OwensMarkus | F | 7/12 | 2 | 1 |
| PittmanAaJah | B | 10/12 | 0 | 2 |
| ReschStephen | B+ | 11/12 | 0 | 1 |
| WellsLynn | B+ | 10/12 | 0 | 1 |

## Common Issues Across Projects

1. **Missing HTML Structure in head.ejs (6 students)**: Many students forgot to include `<!DOCTYPE html>` and `<html lang="en">` in their head.ejs partial. The assignment specifies this should contain "the first half of an HTML page."

2. **Incorrect File Save Location (2 students)**: Some saved index.html to the views folder instead of the project root directory.

3. **Missing or Empty Response Messages (2 students)**: The /print route must inform the user whether the file save was successful or failed.

## Overall Assessment

Most students demonstrated a solid understanding of EJS templating, partials, and Express routing. The most common issue was incomplete HTML structure in the head.ejs partial. Students should review the full HTML document structure and understand that partials split the document at logical points while maintaining valid HTML when assembled.

Excellent work overall! The creative additions (styling, click counters, etc.) show initiative and understanding beyond the basic requirements.

