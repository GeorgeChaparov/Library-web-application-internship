import express from "express";
import http from "node:http";
import { fileURLToPath } from "node:url";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import multer from "multer";
import fs from "fs";
import session from "express-session";
import nodemailer from "nodemailer";

// open the database file
const db = await open({
	filename: "private/library.db",
	driver: sqlite3.Database,
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      password TEXT
  );

  CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      description TEXT,
      image_path TEXT,
	  upload_date TEXT,
	  keywords TEXT
  );

   CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      description TEXT,
      image_path TEXT,
	  upload_date TEXT,
	  document_path TEXT,
	  keywords TEXT
  );
`);

if (!fs.existsSync("./public/articles")) {
	fs.mkdirSync("./public/articles");
}

const app = express();
const server = http.createServer(app);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __htmlDriName = path.join(__dirname, "public", "HTML");

// Middleware
app.use(express.static("public"));
app.use(express.json({ limit: "205mb" })); // limit: 205MB per request. 50MB for the images (5MB each, up to 10), 150MB for the images (15MB each, up to 10) and 5MB for other info just to be sure.
app.use(express.urlencoded({ limit: "205mb", extended: true })); // limit: 205MB per request. 50MB for the images (5MB each, up to 10), 150MB for the images (15MB each, up to 10) and 5MB for other info just to be sure.
app.use(
	session({
		secret: "cfjdtxfgdghjgjclrbtbtbjylu2235666gdvfw2567hfd$^^%$#@!#$rbgdd",
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
);

var imageUploadDir = "";
var fileUploadDir = "";

// Function to decode UTF-8 encoded filenames
function decodeFilename(filename) {
	return Buffer.from(filename, "latin1").toString("utf8");
}

const imageStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, imageUploadDir);
	},
	filename: (req, file, cb) => {
		const decodedFilename = decodeFilename(file.originalname).replaceAll(" ", "_");
		cb(null, decodedFilename);
	},
});

const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } }); // limit: 5MB per file.

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, fileUploadDir);
	},
	filename: (req, file, cb) => {
		const decodedFilename = decodeFilename(file.originalname).replaceAll(" ", "_");
		cb(null, decodedFilename);
	},
});

const uploadfile = multer({ storage: fileStorage, limits: { fileSize: 15 * 1024 * 1024 } }); // limit: 15MB per file.

app.get("/", (req, res) => {
	res.sendFile(path.join(__htmlDriName, "index.html"));
});

app.get("/admin", (req, res) => {
	res.sendFile(path.join(__htmlDriName, "adminLogin.html"));
});

app.post("/loadEditArticleView", isAdmin, (req, res) => {
	res.json({ redirectUrl: "/editArticle" });
});

app.get("/editArticle", isAdmin, (req, res) => {
	res.sendFile(path.join(__htmlDriName, "editArticleView.html"));
});

app.post("/loadAdminArticleView", isAdmin, (req, res) => {
	res.json({ redirectUrl: "/adminArticle" });
});

app.get("/adminArticle", isAdmin, (req, res) => {
	res.sendFile(path.join(__htmlDriName, "adminArticleView.html"));
});

app.post("/loadCreateArticleView", isAdmin, (req, res) => {
	res.json({ redirectUrl: "/createArticle" });
});

app.get("/createArticle", isAdmin, (req, res) => {
	res.sendFile(path.join(__htmlDriName, "createArticleView.html"));
});

app.post("/loadAdminProjectView", isAdmin, async (req, res) => {
	res.json({ redirectUrl: "/adminProject" });
});

app.get("/adminProject", isAdmin, async (req, res) => {
	res.sendFile(path.join(__htmlDriName, "adminProjectView.html"));
});

app.post("/loadCreateProjectView", isAdmin, async (req, res) => {
	res.json({ redirectUrl: "/createProject" });
});

app.get("/createProject", isAdmin, async (req, res) => {
	res.sendFile(path.join(__htmlDriName, "createProjectView.html"));
});

app.post("/loadEditProjectView", isAdmin, async (req, res) => {
	res.json({ redirectUrl: "/editProject" });
});

app.get("/editProject", isAdmin, async (req, res) => {
	res.sendFile(path.join(__htmlDriName, "editProjectView.html"));
});

app.post("/loadViewArticle", (req, res) => {
	res.json({ redirectUrl: "/article" });
});

app.get("/article", (req, res) => {
	res.sendFile(path.join(__htmlDriName, "views", "viewArticle.html"));
});

app.post("/loadViewProject", (req, res) => {
	res.json({ redirectUrl: "/project" });
});

app.get("/project", (req, res) => {
	res.sendFile(path.join(__htmlDriName, "views", "viewProject.html"));
});

app.post("/loadArticlesView", (req, res) => {
	res.json({ redirectUrl: "/articles" });
});

app.get("/articles", (req, res) => {
	res.sendFile(path.join(__htmlDriName, "articlesView.html"));
});

app.post("/loadProjectsView", (req, res) => {
	res.json({ redirectUrl: "/projects" });
});

app.get("/projects", (req, res) => {
	res.sendFile(path.join(__htmlDriName, "projectsView.html"));
});

app.post("/loadHome", (req, res) => {
	res.json({ redirectUrl: "/home" });
});

app.get("/home", (req, res) => {
	res.sendFile(path.join(__htmlDriName, "index.html"));
});

app.post("/loadAbout", (req, res) => {
	res.json({ redirectUrl: "/about" });
});

app.get("/about", (req, res) => {
	res.sendFile(path.join(__htmlDriName, "about.html"));
});

app.post("/loadContacts", (req, res) => {
	res.json({ redirectUrl: "/contacts" });
});

app.get("/contacts", (req, res) => {
	res.sendFile(path.join(__htmlDriName, "contacts.html"));
});

// Returns the size of given image.
app.post("/getImageSize", async function (req, res) {
	const { image_path } = req.body;

	try {
		const stats = await fs.promises.stat(path.join(__dirname, "public", image_path.slice(1)));
		const imageSize = stats.size;
		res.json(imageSize);
	} catch (error) {
		res.status(500).send("Internal Server Error");
		console.log(error);
	}
});

// Gets a specific article from the database.
app.post("/getSpecificArticle", async function (req, res) {
	try {
		const { id } = req.body;
		const article = await db.get("SELECT * FROM articles WHERE id = ?", [id]);

		if (article) {
			res.json(article);
		} else {
			res.status(404).send("Article not found");
		}
	} catch (error) {
		res.status(500).send("Internal Server Error");
		console.log(error);
	}
});

// Gets a specific project from the database.
app.post("/getSpecificProject", async function (req, res) {
	try {
		const { id } = req.body;
		const project = await db.get("SELECT * FROM projects WHERE id = ?", [id]);

		if (project) {
			res.json(project);
		} else {
			res.status(404).send("Project not found");
		}
	} catch (error) {
		res.status(500).send("Internal Server Error");
		console.log(error);
	}
});

// Gets all information for all articles from the database.
app.get("/getArticles", async (req, res) => {
	try {
		const users = await db.all("SELECT * FROM articles");
		res.json(users);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

// Gets all information for all projects from the database.
app.get("/getProjects", async (req, res) => {
	try {
		const users = await db.all("SELECT * FROM projects");
		res.json(users);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

app.get("/getLastNineArticles", async (req, res) => {
	try {
		const users = await db.all("SELECT id, title, description, image_path, upload_date FROM articles ORDER BY id DESC LIMIT 9;");
		res.json(users);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

// Checks if the account information provided in the form on the adminLogin page matches any account in the database.
app.post("/checkAdminAccount", async (req, res) => {
	const { userName, password } = req.body;

	if (!userName || !password) {
		return res.json({ message: "Username and password are required." });
	}

	try {
		const row = await db.get("SELECT user_name, password FROM accounts WHERE user_name = ?", [userName]);

		if (row) {
			if (password === row.password) {
				req.session.userName = row.user_name;

				console.log("User logged in:", row.user_name);

				return res.json({ redirectUrl: "/adminArticle" });
			} else {
				console.log("Invalid password for user:", row.user_name);
				return res.json({ message: "Login unsuccessful. Invalid username or password." });
			}
		} else {
			console.log("No user found with the provided username.");
			return res.json({ message: "Login unsuccessful. Invalid username or password." });
		}
	} catch (err) {
		console.error("Log in unsuccessful. Error:", err);
		res.status(500).send("Internal server error.");
	}
});

app.post("/sendEmail", (req, res) => {
	const { senderName, senderTitle, senderEmail, senderMessage } = req.body;

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "georgechaparov@gmail.com",
			pass: "*************************",
		},
	});

	const mailOptions = {
		from: senderEmail,
		to: "georgechaparov@gmail.com",
		subject: "New Contact Form Submission",
		html: `<h2>Contact Form Submission</h2>
              <p><strong>Title:</strong> ${senderTitle}</p>
              <p><strong>Sender:</strong> ${senderName}, ${senderEmail}</p>
              <p><strong>Message:</strong><br>${senderMessage}</p>`,
	};

	// Send email
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
			res.json({ message: "Error sending email!" });
		} else {
			console.log("Email sent: " + info.response);
			res.json({ message: "Email send successfully!" });
		}
	});
});

// Updates all data for a specific article except the image path.
app.put("/updateArticleData", isAdmin, async (req, res) => {
	const { id, title, content, description, date, keywords } = req.body;

	if (!title) {
		return res.status(400).send("Title is required.");
	}

	if (!content) {
		return res.status(400).send("Content is required.");
	}

	if (!date) {
		return res.status(400).send("Date is required.");
	}

	try {
		await db.run("UPDATE articles SET title = ?, content = ?, description = ?, upload_date = ?, keywords = ? WHERE id = ?", [title, content, description, date, keywords, id]);
		res.status(200).send("Article updated successfully.");
	} catch (err) {
		console.error("Error updating article:", err);
		res.status(500).send("Internal server error.");
	}
});

// Updates all data for a specific project except the image path.
app.put("/updateProjectData", isAdmin, async (req, res) => {
	const { id, title, content, description, date, keywords } = req.body;

	if (!title) {
		return res.status(400).send("Title is required.");
	}

	if (!content) {
		return res.status(400).send("Content is required.");
	}

	if (!date) {
		return res.status(400).send("Date is required.");
	}

	try {
		await db.run("UPDATE projects SET title = ?, content = ?, description = ?, upload_date = ?, keywords = ? WHERE id = ?", [title, content, description, date, keywords, id]);
		res.status(200).send("Project updated successfully.");
	} catch (err) {
		console.error("Error updating project:", err);
		res.status(500).send("Internal server error.");
	}
});

// Creates the folder of the article in which the image will be saves. If the folder exsists, delets the old image in it.
app.put("/updateArticleImageDir", isAdmin, async (req, res) => {
	const { id } = req.body;

	imageUploadDir = `./public/articles/${id}`;

	if (fs.existsSync(imageUploadDir)) {
		try {
			// Read the contents of the directory
			const files = await fs.promises.readdir(imageUploadDir);

			if (files[0]) {
				// Loop through each file and delete it
				for (const file of files) {
					const filePath = path.join(imageUploadDir, file);

					await fs.promises.unlink(filePath); // Delete the file
				}
				res.status(200).send("All files have been deleted.");
				console.log("All files have been deleted.");
			} else {
				res.status(200).send("No files. All is good.");
			}
		} catch (error) {
			console.error("Error deleting files:", error);
		}
	} else {
		fs.mkdirSync(imageUploadDir);
		res.status(200).send("Folder created.");
	}
});

// Creates the folder of the article in which the image will be saves. If the folder exsists, delets the old image in it.
app.put("/updateProjectImageDir", isAdmin, async (req, res) => {
	const { id } = req.body;

	imageUploadDir = `./public/projects/${id}/images`;

	if (fs.existsSync(imageUploadDir)) {
		try {
			// Read the contents of the directory
			const files = await fs.promises.readdir(imageUploadDir);

			if (files[0]) {
				// Loop through each file and delete it
				for (const file of files) {
					const filePath = path.join(imageUploadDir, file);

					await fs.promises.unlink(filePath); // Delete the file
				}
				res.status(200).send("All files have been deleted.");
				console.log("All files have been deleted.");
			} else {
				res.status(200).send("No files. All is good.");
			}
		} catch (error) {
			console.error("Error deleting files:", error);
		}
	} else {
		if (!fs.existsSync(`./public/projects`)) {
			fs.mkdirSync(`./public/projects`);
		}

		fs.mkdirSync(`./public/projects/${id}`);
		fs.mkdirSync(imageUploadDir);
		res.status(200).send("Folder created.");
	}
});

// Creates the folder of the article in which the image will be saves. If the folder exsists, delets the old image in it.
app.put("/updateProjectFileDir", isAdmin, async (req, res) => {
	const { id } = req.body;

	fileUploadDir = `./public/projects/${id}/files`;

	if (fs.existsSync(fileUploadDir)) {
		try {
			// Read the contents of the directory
			const files = await fs.promises.readdir(fileUploadDir);

			if (files[0]) {
				// Loop through each file and delete it
				for (const file of files) {
					const filePath = path.join(fileUploadDir, file);

					await fs.promises.unlink(filePath); // Delete the file
				}
				res.status(200).send("All files have been deleted.");
				console.log("All files have been deleted.");
			} else {
				res.status(200).send("No files. All is good.");
			}
		} catch (error) {
			console.error("Error deleting files:", error);
		}
	} else {
		fs.mkdirSync(fileUploadDir);
		res.status(200).send("Folder created.");
	}
});

// Updates the image path of specific article and uploads it to the server.
app.put("/updateArticleImage", uploadImage.array("images", 10), isAdmin, async (req, res) => {
	const { id } = req.body;

	let imagePath = "";

	for (let i = 0; i < req.files.length; i++) {
		const file = req.files[i];

		imagePath += `../articles/${id}/${file.filename}|||`;
	}

	imagePath += "|";

	try {
		await db.run("UPDATE articles SET image_path = ? WHERE id = ?", [imagePath, id]);
		res.status(200).send("Image updated successfully.");
	} catch (err) {
		console.error("Error updating image :", err);
		res.status(500).send("Internal server error.");
	}
});

// Updates the image of specific project and uploads it to the server.
app.put("/updateProjectImage", uploadImage.array("images", 10), isAdmin, async (req, res) => {
	const { id } = req.body;

	let imagePath = "";

	for (let i = 0; i < req.files.length; i++) {
		const file = req.files[i];

		imagePath += `../projects/${id}/images/${file.filename}|||`;
	}

	imagePath += "|";

	try {
		await db.run("UPDATE projects SET image_path = ? WHERE id = ?", [imagePath, id]);
		res.status(200).send("Image updated successfully.");
	} catch (err) {
		console.error("Error updating image:", err);
		res.status(500).send("Internal server error.");
	}
});

// Updates the file of specific project and uploads it to the server.
app.put("/updateProjectFile", uploadfile.array("files", 10), isAdmin, async (req, res) => {
	const { id } = req.body;

	let imagePath = "";

	for (let i = 0; i < req.files.length; i++) {
		const file = req.files[i];

		imagePath += `../projects/${id}/files/${file.filename}|||`;
	}

	imagePath += "|";

	try {
		await db.run("UPDATE projects SET document_path = ? WHERE id = ?", [imagePath, id]);
		res.status(200).send("Image updated successfully.");
	} catch (err) {
		console.error("Error updating image:", err);
		res.status(500).send("Internal server error.");
	}
});

app.put("/updateArticleImageNoChange", isAdmin, async (req, res) => {
	const { id, imagesPath } = req.body;
	try {
		await db.run("UPDATE articles SET image_path = ? WHERE id = ?", [imagesPath, id]);
		res.status(200).send("Image path updated successfully.");

		console.log("Image path updated successfully.");
	} catch (err) {
		console.error("Error updating image path:", err);
		res.status(500).send("Internal server error.");
	}
});

app.put("/updateProjectImageNoChange", isAdmin, async (req, res) => {
	const { id, imagesPath } = req.body;
	try {
		await db.run("UPDATE projects SET image_path = ? WHERE id = ?", [imagesPath, id]);
		res.status(200).send("Image path updated successfully.");

		console.log("Image path updated successfully.");
	} catch (err) {
		console.error("Error updating image path:", err);
		res.status(500).send("Internal server error.");
	}
});

app.put("/updateProjectFileNoChange", isAdmin, async (req, res) => {
	const { id, filesPath } = req.body;
	try {
		await db.run("UPDATE projects SET document_path = ? WHERE id = ?", [filesPath, id]);
		res.status(200).send("Image path updated successfully.");

		console.log("File path updated successfully.");
	} catch (err) {
		console.error("Error updating file path:", err);
		res.status(500).send("Internal server error.");
	}
});

// Inserts the new article into the database.
app.put("/createArticle", isAdmin, async (req, res) => {
	const { title, content, description, date, keywords } = req.body;

	if (!title) {
		return res.status(400).send("Title is required.");
	}

	if (!content) {
		return res.status(400).send("Content is required.");
	}

	if (!date) {
		return res.status(400).send("Date is required.");
	}

	try {
		const result = await db.run("INSERT INTO articles (title, content, description, upload_date, keywords) VALUES (?, ?, ?, ?, ?)", [title, content, description, date, keywords]);

		// Get the ID of the newly created article
		const articleId = result.lastID;

		res.status(200).json({ message: "Article added successfully.", id: articleId });
	} catch (err) {
		console.error("Error inserting article:", err);
		res.status(500).send("Internal server error.");
	}
});

// Inserts the new project into the database.
app.put("/createProject", isAdmin, async (req, res) => {
	const { title, content, description, date, keywords } = req.body;

	if (!title) {
		return res.status(400).send("Title is required.");
	}

	if (!content) {
		return res.status(400).send("Content is required.");
	}

	if (!date) {
		return res.status(400).send("Date is required.");
	}

	try {
		const result = await db.run("INSERT INTO projects (title, content, description, upload_date, keywords) VALUES (?, ?, ?, ?, ?)", [title, content, description, date, keywords]);

		// Get the ID of the newly created article
		const projectId = result.lastID;

		res.status(200).json({ message: "Project added successfully.", id: projectId });
	} catch (err) {
		console.error("Error inserting project:", err);
		res.status(500).send("Internal server error.");
	}
});

// Updates all data for a specific article except the image path.
app.put("/deleteArticle", isAdmin, async (req, res) => {
	const { id } = req.body;

	try {
		// Extract the directory path from the image path
		const folderPath = path.join(__dirname, "public", "articles", id);

		// Check if the directory exists
		if (fs.existsSync(folderPath)) {
			// Remove the directory and its contents
			await fs.promises.rm(folderPath, { recursive: true, force: true });
			console.log(`Folder ${folderPath} deleted successfully.`);
		} else {
			console.log(`Folder ${folderPath} does not exist.`);
		}

		await db.run("DELETE FROM articles WHERE id = ?", [id]);
		res.status(200).send("Article deleted successfully.");
	} catch (err) {
		console.error("Error deleting article:", err);
		res.status(500).send("Internal server error.");
	}
});

// Updates all data for a specific article except the image path.
app.put("/deleteProject", isAdmin, async (req, res) => {
	const { id } = req.body;

	try {
		// Extract the directory path from the image path
		const folderPath = path.join(__dirname, "public", "projects", id);

		// Check if the directory exists
		if (fs.existsSync(folderPath)) {
			// Remove the directory and its contents
			await fs.promises.rm(folderPath, { recursive: true, force: true });
			console.log(`Folder ${folderPath} deleted successfully.`);
		} else {
			console.log(`Folder ${folderPath} does not exist.`);
		}

		await db.run("DELETE FROM projects WHERE id = ?", [id]);
		res.status(200).send("Project deleted successfully.");
	} catch (err) {
		console.error("Error deleting project:", err);
		res.status(500).send("Internal server error.");
	}
});

// Checking if the user is logged as admin.
function isAdmin(req, res, next) {
	if (req.session && req.session.userName) {
		return next();
	} else {
		return res.status(403).send("Unauthorized. Please log in as admin.");
	}
}

server.listen(3000, () => {
	console.log("Server running at http://localhost:3000");
});
