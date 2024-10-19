document.addEventListener("DOMContentLoaded", async function () {
	const contentBorder = document.getElementById("content-borders");
	const mainContentDiv = document.getElementById("main-content");
	const articleTitle = document.getElementById("article-title");
	const articleDate = document.getElementById("article-date");
	const articleContent = document.getElementById("article-content");
	const articleImageHolder = document.getElementById("image-holder");

	const smallImageWrapper = document.getElementById("small-images-wrapper");
	const smallImageContent = document.getElementById("small-images-content");

	const imagesPath = [];

	if (window.innerWidth < 1000) {
		for (let i = contentBorder.children.length - 1; i >= 0; i--) {
			contentBorder.children[i].remove();
		}

		contentBorder.appendChild(articleTitle);
		contentBorder.appendChild(articleDate);
		contentBorder.appendChild(articleImageHolder);

		let div = document.createElement("div");
		div.style.display = "flex";
		div.style.flexDirection = "row";

		div.appendChild(mainContentDiv);
		div.appendChild(smallImageContent);

		contentBorder.appendChild(div);
	}

	try {
		const articleId = { id: sessionStorage.getItem("id") };

		const response = await fetch("/getSpecificArticle", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(articleId),
		});

		if (!response.ok) throw new Error("Network response was not ok");

		const article = await response.json();

		let count = 0;
		let lastEndIndex = 0;
		for (let i = 0; i < article.image_path.length; i++) {
			const char = article.image_path.charAt(i);

			if (count === 3) {
				imagesPath.push(article.image_path.slice(lastEndIndex, i - 3));
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

		articleTitle.innerHTML = article.title;
		articleContent.innerHTML = article.content;
		articleDate.innerHTML = article.upload_date;
		articleImageHolder.src = imagesPath[0];
		articleImageHolder.addEventListener("click", openImage);

		injectMetaTags({ title: article.title, content: article.content, description: article.description, image: imagesPath[0], keywords: article.keywords, date: article.date });
	} catch (error) {
		console.error("Error fetching article:", error);
	}

	window.addEventListener("resize", function (event) {
		let screenWidth = window.innerWidth;

		if (screenWidth < 1000) {
			for (let i = contentBorder.children.length - 1; i >= 0; i--) {
				contentBorder.children[i].remove();
			}

			contentBorder.appendChild(articleTitle);
			contentBorder.appendChild(articleDate);
			contentBorder.appendChild(articleImageHolder);

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

			mainContentDiv.appendChild(articleImageHolder);
			mainContentDiv.appendChild(articleTitle);
			mainContentDiv.appendChild(articleDate);
			mainContentDiv.appendChild(articleContent);

			smallImageContent.appendChild(smallImageWrapper);

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

function injectMetaTags(article) {
	document.title = article.title;

	const descriptionMeta = document.querySelector('meta[name="description"]');
	if (descriptionMeta) {
		descriptionMeta.setAttribute("content", article.description);
	}

	const keywordsMeta = document.querySelector('meta[name="keywords"]');
	if (keywordsMeta) {
		keywordsMeta.setAttribute("content", article.keywords);
	}

	injectOpenGraphMetaTags(article);
	injectStructuredData(article);
}

function injectOpenGraphMetaTags(article) {
	const ogTitleMeta = createOrSelectMetaTag("property", "og:title");
	ogTitleMeta.setAttribute("content", article.title);

	const ogDescriptionMeta = createOrSelectMetaTag("property", "og:description");
	ogDescriptionMeta.setAttribute("content", article.description);

	const ogTypeMeta = createOrSelectMetaTag("property", "og:type");
	ogTypeMeta.setAttribute("content", "news");
}

function injectStructuredData(article) {
	const script = document.createElement("script");
	script.type = "application/ld+json";
	script.text = JSON.stringify({
		"@context": "http://schema.org",
		"@type": "News",
		headline: article.title,
		datePublished: article.date,
		articleBody: article.content,
		keywords: article.keywords,
	});
	document.head.appendChild(script);
}
