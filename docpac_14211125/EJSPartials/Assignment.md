**EJS Partials, Rendering, and Static HTML Generation**

In this assignment, you will create a Node.js + Express application that uses EJS for templating, includes reusable partials, and renders a standalone HTML file for printing.

**Part 1 - Project Setup**

- **Create a new Node.js project.**
  - Initialize it with npm init -y.
- **Install the required packages.**
  - Install Express and EJS:
  - npm install express ejs
- **Create an Express server.**
  - Make a file named server.js (or index.js) that starts an HTTP listening server using Express.
- **Configure Express to use EJS as its view engine.**
  - In your server file, set:
  - app.set('view engine', 'ejs');

**Part 2 - Folder Structure**

- **Create a folder called views.**
- **Inside views, create a folder called partials.**  
    Your structure should look like:
- /views
- /partials

**Part 3 - Create EJS Partials**

- **Create a file: /views/partials/head.ejs**  
    This file must include _the first half of an HTML page_, such as:
  - &lt;!DOCTYPE html&gt;
  - &lt;html&gt; opening tag
  - &lt;head&gt; and anything inside it
  - &lt;style&gt; (optional)
  - &lt;script&gt; (optional)
  - **STOP before the &lt;body&gt; tag**
  - Include some basic CSS so you can verify that the partial is loading correctly.
- **Create a file: /views/partials/foot.ejs**  
    This partial contains everything that appears _after_ the &lt;/body&gt; tag.
  - For most pages, this is only:
  - &lt;/html&gt;

**Part 4 - Create Main Template**

- **Create /views/index.ejs.**  
    This file must:
  - Include head.ejs at the top.
  - Add the &lt;body&gt; element and any content you want in the page.
  - Inside the body, check the EJS variable viewport:
  - &lt;% if (viewport === "online") { %&gt;
  - &lt;button onclick="window.location='/print'"&gt;Print&lt;/button&gt;
  - &lt;% } %&gt;
  - Include foot.ejs at the end.

**Part 5 - Routes and Rendering**

- **Create two routes in your Express app: / and /print.**
- **Route /**

- Render index.ejs normally.
- Pass a variable named viewport with the value "online":
- res.render("index", { viewport: "online" });

- **Route /print**

- Use EJS to render the template to a string **instead of sending it to the browser**.
- Pass viewport: "offline".
- Save the rendered HTML string as a file called index.html in your project directory.
  - Use Node's fs module (fs.writeFile) to write the file.
- Use res.send() to tell the user whether the file was successfully saved.

**Part 6 - Testing Checklist**

- **Test the following:**

- Do the partials load correctly?  
    _The CSS from head.ejs should appear on the page._
- Does the "Print" button appear when you visit / on your computer?
- When you click the "Print" button:
  - Does /print successfully generate an index.html file?
  - Does the server tell you whether the write succeeded?
- Open the generated index.html in a browser:
  - The print button **should NOT appear** in this version.