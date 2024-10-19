const monthNames = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];

document.addEventListener("DOMContentLoaded", async function () {
	const form = document.getElementById("form");

	const articleTitle = document.getElementById("title");
	const articleContent = document.getElementById("article-content");
	const articleDescription = document.getElementById("description");
	const articlePublishDate = document.getElementById("date");
	const articleImages = document.getElementById("images");
	const articleImageHolder = document.getElementById("image-holder");
	const articleKeywords = document.getElementById("keywords");

	const cancelButton = document.getElementById("cancel-button");
	const addButton = document.getElementById("add-button");

	const smallImageWrapper = document.getElementById("small-images-wrapper");
	const imageSizeLable = document.getElementById("image-size");

	const content = document.getElementById("content");
	const buttons = document.getElementById("buttons");
	const contentBorders = document.getElementById("content-borders");
	const imagesLable = document.getElementById("images-lable");
	const imagesContent = document.getElementById("images-content");

	const maxImagesSize = 50 * 1024 * 1024; // limit: 50MB (5MB each, up to 10).
	let totalImagesSize = 0;

	let articleId;

	if (window.innerWidth < 1000) {
		content.appendChild(buttons);
		contentBorders.insertBefore(imagesLable, contentBorders.children[1]);
	}

	articleImages.addEventListener("change", function (event) {
		totalImagesSize = 0;

		if (event.target.files.length > 10) {
			alert("You can not add more then 10 images");

			event.target.value = "";

			totalImagesSize = 0;
		} else {
			for (let i = 0; i < event.target.files.length; i++) {
				let size = event.target.files[i].size;

				totalImagesSize += size;

				let sizeInMB = parseFloat(size / (1024 * 1024)).toFixed(2);
				if (sizeInMB > 5) {
					alert("One image cannot be more then 5MB! Image with name " + event.target.files[i].name + " is " + sizeInMB);

					event.target.value = "";
					totalImagesSize = 0;
				}
			}
		}

		const totalImageSizeRounded = (totalImagesSize / (1024 * 1024)).toFixed(2);

		imageSizeLable.innerHTML = `${totalImageSizeRounded}MB / 50MB`;

		if (totalImagesSize > maxImagesSize) {
			imageSizeLable.style.color = "red";
		} else {
			imageSizeLable.style.color = "black";
		}

		if (articleImageHolder.children[0]) {
			articleImageHolder.removeChild(articleImageHolder.children[0]);

			articleImageHolder.style.width = "0";
			articleImageHolder.style.height = "0";
		}

		// Iterate backwards to avoid skipping elements due to changes in the children list.
		for (let i = smallImageWrapper.children.length - 1; i >= 0; i--) {
			const element = smallImageWrapper.children[i];
			smallImageWrapper.removeChild(element);
		}

		if (event.target.files[0]) {
			for (let i = 0; i < event.target.files.length; i++) {
				const image = event.target.files[i];
				const imageUrl = URL.createObjectURL(image);

				if (i == 0) {
					const articleMainImage = document.createElement("div");
					articleMainImage.id = "0";
					articleMainImage.classList.add("draggable-image");
					articleMainImage.style.backgroundImage = `url('${imageUrl}')`;
					articleMainImage.addEventListener("click", openImage);

					articleImageHolder.appendChild(articleMainImage);

					if (window.innerWidth > 1000 || window.innerWidth < 500) {
						articleImageHolder.style.width = "100%";
						articleImageHolder.style.height = "300px";
					} else {
						articleImageHolder.style.width = "420px";
						articleImageHolder.style.height = "300px";
					}

					continue;
				}

				const smallImage = document.createElement("div");
				smallImage.classList.add("small-preview");
				smallImage.classList.add("container");

				const draggableImage = document.createElement("div");
				draggableImage.id = i;
				draggableImage.classList.add("draggable-image");
				draggableImage.style.backgroundImage = `url('${imageUrl}')`;
				draggableImage.addEventListener("click", openImage);

				smallImage.appendChild(draggableImage);
				smallImageWrapper.appendChild(smallImage);
			}

			drake = dragula(Array.from(document.getElementsByClassName("container")), {
				moves: function (el, container, handle) {
					return handle.classList.contains("draggable-image");
				},
			});

			drake.on("drag", function (el, source) {
				document.body.style.overflow = "hidden";
			});

			drake.on("over", function (el, container, source) {
				for (let i = 0; i < container.children.length; i++) {
					const element = container.children[i];

					if (element.classList.value.includes("gu-transit")) {
						element.style.display = "none";
					}
				}
			});

			drake.on("cancel", function (el, source, sibling) {
				el.style.display = "block";
				document.body.style.overflow = "visible";
			});

			drake.on("drop", function (el, target, source, sibling) {
				target.appendChild(el);
				source.appendChild(target.children[0]);
				el.style.display = "block";
				document.body.style.overflow = "visible";
			});
		}
	});

	addButton.addEventListener("click", async function (event) {
		event.preventDefault();

		// No title added.
		if (!articleTitle.value) {
			alert("Title is required");
			return;
		}

		// No content added.
		if (!articleContent.value) {
			alert("Content is required");
			return;
		}

		// No image added.
		if (!articleImages.files[0]) {
			alert("Image is required");
			return;
		}

		// No date added.
		if (!articlePublishDate.value) {
			alert("Date is required");
			return;
		}

		// The added images are too big.
		if (totalImagesSize > maxImagesSize) {
			alert("The total size of the selected files exceeds the 50 MB limit.");
			return;
		}

		await createArticle(); // Inserts the article into the database.

		await createImageDir(); // Create the images dir.
		await saveArticleImage(); // Save the images.

		// Redirect the user back to all articles.
		await redirectBack();
	});

	cancelButton.addEventListener("click", async function (event) {
		if (!confirm("You are about to cancle the creation to this article! Please confirm.")) {
			return;
		}

		await redirectBack();
	});

	async function createImageDir() {
		try {
			const response = await fetch(`/updateArticleImageDir`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: articleId }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function saveArticleImage() {
		const formData = new FormData();

		const orderedList = [];

		orderedList.push(articleImageHolder.children[0].id);

		for (let i = 0; i < smallImageWrapper.children.length; i++) {
			orderedList.push(smallImageWrapper.children[i].children[0].id);
		}

		for (let i = 0; i < articleImages.files.length; i++) {
			formData.append("images", articleImages.files[orderedList[i]]);
		}

		formData.append("id", articleId);

		try {
			const response = await fetch(`/updateArticleImage`, {
				method: "PUT",
				body: formData,
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function createArticle() {
		let date = new Date(articlePublishDate.value);

		let dateYear = date.getFullYear();
		let dateMonth = date.getMonth() + 1; // getMonth() returns 0-based month
		let dateDay = date.getDate();

		let transformedDate = "";

		if (dateDay > 9) {
			transformedDate = `${dateDay} ${monthNames[dateMonth - 1]}, ${dateYear}`;
		} else {
			transformedDate = `0${dateDay} ${monthNames[dateMonth - 1]}, ${dateYear}`;
		}

		try {
			const response = await fetch(`/createArticle`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title: articleTitle.value, content: articleContent.value.replaceAll("\n", "<br>"), description: articleDescription.value, date: transformedDate, keywords: articleKeywords.value }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const data = await response.json();
			articleId = data.id;

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function redirectBack() {
		try {
			const response = await fetch("/loadadminArticleView", { method: "post" });
			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.json();

			window.location.href = result.redirectUrl;
		} catch (error) {
			console.error("Error fetching articles:", error);
		}
	}

	window.addEventListener("resize", function (event) {
		if (articleImageHolder.children[0]) {
			if (window.innerWidth > 1000 || window.innerWidth < 500) {
				articleImageHolder.style.width = "100%";
				articleImageHolder.style.height = "300px";
			} else {
				articleImageHolder.style.width = "420px";
				articleImageHolder.style.height = "300px";
			}
		}

		if (window.innerWidth < 1000) {
			content.appendChild(buttons);
			contentBorders.insertBefore(imagesLable, contentBorders.children[1]);
		} else {
			form.appendChild(buttons);
			imagesContent.insertBefore(imagesLable, imagesContent.firstChild);
		}
	});
});
