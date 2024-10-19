document.addEventListener("DOMContentLoaded", async function () {
	const contentBorder = document.getElementById("content-borders");
	const mainContentDiv = document.getElementById("main-content");
	const projectTitle = document.getElementById("project-title");
	const projectDate = document.getElementById("project-date");
	const projectContent = document.getElementById("project-content");
	const projectImageHolder = document.getElementById("image-holder");
	const fileDisplay = document.getElementById("files-display");

	const smallImageWrapper = document.getElementById("small-images-wrapper");
	const smallImageContent = document.getElementById("small-images-content");

	const imagesPath = [];
	const filesPath = [];

	if (window.innerWidth < 1000) {
		for (let i = contentBorder.children.length - 1; i >= 0; i--) {
			contentBorder.children[i].remove();
		}

		contentBorder.appendChild(projectTitle);
		contentBorder.appendChild(projectDate);
		contentBorder.appendChild(projectImageHolder);

		let div = document.createElement("div");
		div.style.display = "flex";
		div.style.flexDirection = "row";

		div.appendChild(mainContentDiv);
		div.appendChild(smallImageContent);

		contentBorder.appendChild(div);
	}

	try {
		const projectId = { id: sessionStorage.getItem("id") };

		const response = await fetch("/getSpecificProject", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(projectId),
		});

		if (!response.ok) throw new Error("Network response was not ok");

		const project = await response.json();

		const images = project.image_path;

		let count = 0;
		let lastEndIndex = 0;
		for (let i = 0; i < images.length; i++) {
			const char = images.charAt(i);

			if (count === 3) {
				imagesPath.push(images.slice(lastEndIndex, i - 3));
				lastEndIndex = i;
				count = 0;
				continue;
			}

			if (char === "|") {
				++count;
			} else {
				count = 0;
				continue;
			}
		}

		const documents = project.document_path;

		count = 0;
		lastEndIndex = 0;
		for (let i = 0; i < documents.length; i++) {
			const char = documents.charAt(i);

			if (count === 3) {
				filesPath.push(documents.slice(lastEndIndex, i - 3));
				lastEndIndex = i;
				count = 0;
				continue;
			}

			if (char === "|") {
				++count;
			} else {
				count = 0;
				continue;
			}
		}

		for (let i = 0; i < filesPath.length; i++) {
			const file = filesPath[i];
			const fileName = file.slice(file.lastIndexOf("/") + 1);

			const fileDiv = document.createElement("div");
			fileDiv.id = i;
			fileDiv.classList.add("file");

			fileDiv.addEventListener("click", function (event) {
				window.open(file, "_blank");
			});

			fileDisplay.appendChild(fileDiv);

			fileDiv.innerHTML = fileName;
		}

		mainContentDiv.style.alignItems = "flex-start";

		if (imagesPath.length > 1) {
			const img = new Image();
			img.src = imagesPath[0];

			img.onload = function () {
				if (img.height - 100 > img.width) {
					mainContentDiv.style.alignItems = "center";
				}

				URL.revokeObjectURL(img.src);
			};

			for (let i = 1; i < imagesPath.length; i++) {
				const path = imagesPath[i];

				const smallImage = document.createElement("div");
				smallImage.classList.add("small-preview");
				smallImage.style.backgroundImage = "url('" + path + "')";

				smallImage.addEventListener("click", openImage);

				smallImageWrapper.appendChild(smallImage);
			}
		} else {
			smallImageWrapper.style.width = "0";
			smallImageWrapper.style.height = "0";
			smallImageWrapper.parentElement.style.width = "0";
			smallImageWrapper.parentElement.style.height = "0";

			mainContentDiv.style.alignItems = "center";
		}

		projectTitle.innerHTML = project.title;
		projectContent.innerHTML = project.content;
		projectDate.innerHTML = project.upload_date;
		projectImageHolder.src = imagesPath[0];
		projectImageHolder.addEventListener("click", openImage);

		injectMetaTags({ title: project.title, content: project.content, description: project.description, image: imagesPath[0], keywords: project.keywords, date: project.date });
	} catch (error) {
		console.error("Error fetching project:", error);
	}

	window.addEventListener("resize", function (event) {
		let screenWidth = window.innerWidth;

		if (screenWidth < 1000) {
			for (let i = contentBorder.children.length - 1; i >= 0; i--) {
				contentBorder.children[i].remove();
			}

			contentBorder.appendChild(projectTitle);
			contentBorder.appendChild(projectDate);
			contentBorder.appendChild(projectImageHolder);

			let div = document.createElement("div");
			div.style.display = "flex";
			div.style.flexDirection = "row";

			div.appendChild(mainContentDiv);
			div.appendChild(smallImageContent);

			contentBorder.appendChild(div);
		} else {
			for (let i = contentBorder.children.length - 1; i >= 0; i--) {
				contentBorder.children[i].remove();
			}

			for (let i = mainContentDiv.children.length - 1; i >= 0; i--) {
				mainContentDiv.children[i].remove();
			}

			mainContentDiv.appendChild(projectImageHolder);
			mainContentDiv.appendChild(projectTitle);
			mainContentDiv.appendChild(projectDate);
			mainContentDiv.appendChild(projectContent);

			smallImageContent.insertBefore(smallImageWrapper, smallImageContent.firstChild);

			contentBorder.appendChild(smallImageContent);
			contentBorder.appendChild(mainContentDiv);
		}
	});
});

function createOrSelectMetaTag(attributeName, attributeValue) {
	let metaTag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
	if (!metaTag) {
		metaTag = document.createElement("meta");
		metaTag.setAttribute(attributeName, attributeValue);
		document.head.appendChild(metaTag);
	}
	return metaTag;
}

function injectMetaTags(project) {
	document.title = project.title;

	const descriptionMeta = document.querySelector('meta[name="description"]');
	if (descriptionMeta) {
		descriptionMeta.setAttribute("content", project.description);
	}

	const keywordsMeta = document.querySelector('meta[name="keywords"]');
	if (keywordsMeta) {
		keywordsMeta.setAttribute("content", project.keywords);
	}

	injectOpenGraphMetaTags(project);
	injectStructuredData(project);
}

function injectOpenGraphMetaTags(project) {
	const ogTitleMeta = createOrSelectMetaTag("property", "og:title");
	ogTitleMeta.setAttribute("content", project.title);

	const ogDescriptionMeta = createOrSelectMetaTag("property", "og:description");
	ogDescriptionMeta.setAttribute("content", project.description);

	const ogTypeMeta = createOrSelectMetaTag("property", "og:type");
	ogTypeMeta.setAttribute("content", "project");
}

function injectStructuredData(project) {
	const script = document.createElement("script");
	script.type = "application/ld+json";
	script.text = JSON.stringify({
		"@context": "http://schema.org",
		"@type": "Project",
		headline: project.title,
		datePublished: project.date,
		articleBody: project.content,
		keywords: project.keywords,
	});
	document.head.appendChild(script);
}
