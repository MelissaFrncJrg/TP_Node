const http = require("http");
const pug = require("pug");
const url = require("url");
const fs = require("fs");
const utils = require("./utils/utils.js");
const dotenv = require("dotenv");
const path = require("path");
const querystring = require("querystring");

dotenv.config();

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url, true);
  if (pathname === "/style.css") {
    fs.promises
      .readFile("./assets/css/style.css", "utf8")
      .then((data) => {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(data);
      })
      .catch((err) => {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Internal Server Error");
      });

    return;
  } else if (pathname === "/") {
    if (req.method === "GET") {
      try {
        res.writeHead(200, { "Content-Type": "text/html" });
        const template = pug.renderFile(
          path.join(__dirname, "views", "home.pug")
        );
        res.end(template);
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("Internal Server Error");
      }
    }
  } else if (pathname === "/students") {
    if (req.method === "GET") {
      try {
        const compiledFunction = pug.compileFile(
          path.join(__dirname, "views", "students.pug")
        );
        utils.getStudents().then((students) => {
          const renderedHTML = compiledFunction({
            students,
            formatBirthdate: utils.formatBirthdate,
            deleteStudent: utils.deleteStudent,
          });

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(renderedHTML);
        });
      } catch (error) {
        console.log(error);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("Internal Server Error");
      }
    }
  } else if (pathname === "/students/add") {
    console.log(pathname);
    if (req.method === "POST") {
      let requestBody = "";
      req.on("data", (chunk) => {
        requestBody += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const { name, birth } = querystring.parse(requestBody);
          const isAdded = await utils.addStudent(name, birth);
          if (isAdded) {
            res.writeHead(301, { Location: "/" });
            res.end("Student added successfully");
          } else {
            res.statusCode = 404;
            res.end("Bad entry");
          }
        } catch (error) {
          console.log(error);
          res.statusCode = 500;
          res.end("Internal error");
        }
      });
    } else {
      res.statusCode = 404;
      res.end("Page not found");
    }
  } else if (pathname.includes("students/delete/")) {
    console.log(pathname);
    const name = pathname.slice(17);
    console.log(name);
    utils
      .deleteStudent(name)
      .then((data) => {
        res.writeHead(301, { Location: "/students" });
        res.end("is deleted");
      })
      .catch((error) => {
        console.log(error);
        res.statusCode = 500;
        res.end("Internal error");
      });
  } else {
    res.statusCode = 404;
    res.end("Page not found");
  }
});

server.listen(process.env.APP_PORT, () => {
  console.log(
    `Server running at http://${process.env.APP_HOST}:${process.env.APP_PORT}/`
  );
});
