const monthNames = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];

document.addEventListener("DOMContentLoaded", async function () {
	const form = document.getElementById("form");

	const articleFormId = document.getElementById("id");
	const articleTitle = document.getElementById("title");
	const articleContent = document.getElementById("article-content");
	const articleDescription = document.getElementById("description");
	const articlePublishDate = document.getElementById("date");
	const articleImages = document.getElementById("images");
	const articleImageHolder = document.getElementById("image-holder");
	const articleKeywords = document.getElementById("keywords");

	const deleteButton = document.getElementById("delete-button");
	const cancelButton = document.getElementById("cancel-button");
	const updateButton = document.getElementById("update-button");

	const smallImageWrapper = document.getElementById("small-images-wrapper");
	const imageSizeLable = document.getElementById("image-size");

	const content = document.getElementById("content");
	const buttons = document.getElementById("buttons");
	const contentBorders = document.getElementById("content-borders");
	const imagesLable = document.getElementById("images-lable");
	const imagesContent = document.getElementById("images-content");

	const maxImagesSize = 50 * 1024 * 1024; // limit: 50MB (5MB each, up to 10).
	let totalImagesSize = 0;

	const imagesPath = [];
	let imagesSize = 0;

	if (window.innerWidth < 1000) {
		content.appendChild(buttons);
		contentBorders.insertBefore(imagesLable, contentBorders.children[1]);
	}

	try {
		const articleId = sessionStorage.getItem("id");

		const response = await fetch(`/getSpecificArticle?id=${articleId}`);

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

		try {
			const response = await fetch(`/getImageSize?imagesPath=${imagesPath[0]}`);

			if (!response.ok) throw new Error("Network response was not ok");

			const imageSize = await response.json();

			totalImagesSize += imageSize;
		} catch (err) {
			console.error(err);
		}

		const articleMainImage = document.createElement("div");
		articleMainImage.id = "0";
		articleMainImage.classList.add("draggable-image");
		articleMainImage.style.backgroundImage = "url('" + imagesPath[0] + "')";
		articleMainImage.addEventListener("click", openImage);

		articleImageHolder.appendChild(articleMainImage);

		if (window.innerWidth > 1000 || window.innerWidth < 500) {
			articleImageHolder.style.width = "100%";
			articleImageHolder.style.height = "300px";
		} else {
			articleImageHolder.style.width = "420px";
			articleImageHolder.style.height = "300px";
		}

		for (let i = 1; i < imagesPath.length; i++) {
			const path = imagesPath[i];

			try {
				const response = await fetch(`/getImageSize?imagesPath=${imagesPath[i]}`);

				if (!response.ok) throw new Error("Network response was not ok");

				const imageSize = await response.json();

				totalImagesSize += imageSize;
			} catch (err) {
				console.error(err);
			}

			const image = imagesPath[i];

			const smallImage = document.createElement("div");
			smallImage.classList.add("small-preview");
			smallImage.classList.add("container");

			const draggableImage = document.createElement("div");
			draggableImage.id = i;
			draggableImage.classList.add("draggable-image");
			draggableImage.style.backgroundImage = "url('" + image + "')";
			draggableImage.addEventListener("click", openImage);
			
			smallImage.appendChild(draggableImage);
			smallImageWrapper.appendChild(smallImage);
		}

		imagesSize = totalImagesSize;

		const totalImageSizeRounded = (totalImagesSize / (1024 * 1024)).toFixed(2);

		imageSizeLable.innerHTML = `${totalImageSizeRounded}MB / 50MB`;

		let comma = article.upload_date.indexOf(",");

		let dateYear = article.upload_date.slice(comma + 2);
		let dateMonth = article.upload_date.slice(3, comma);
		let dateDay = article.upload_date.slice(0, 2);

		const month = monthNames.findIndex((month) => month.toLowerCase() === dateMonth.toLowerCase());

		let transformedDate = "";

		if (month > 9) {
			transformedDate = `${dateYear}-${month + 1}-${dateDay}`;
		} else {
			transformedDate = `${dateYear}-0${month + 1}-${dateDay}`;
		}

		articleFormId.value = article.id;
		articleTitle.value = article.title;
		articlePublishDate.value = transformedDate;
		articleContent.value = article.content.replaceAll("<br>", "\n");
		articleDescription.value = article.description;
		articleKeywords.value = article.keywords;

		const drake = dragula(Array.from(document.getElementsByClassName("container")), {
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
	} catch (error) {
		console.error("Error fetching article:", error);
	}

	articleImages.addEventListener("change", function (event) {
		let arrToUse; // Array from which the images will be taken.
		let usingOriginalImages = false; // Flag to check if original images are being used.

		totalImagesSize = 0;

		if (event.target.files.length > 10) {
			alert("You can not add more then 10 images");

			event.target.value = "";
			totalImagesSize = imagesSize;
		} else {
			for (let i = 0; i < event.target.files.length; i++) {
				let size = event.target.files[i].size;

				totalImagesSize += size;

				let sizeInMB = parseFloat(size / (1024 * 1024)).toFixed(2);
				if (sizeInMB > 5) {
					alert("One image cannot be more then 5MB! Image with name " + event.target.files[i].name + " is " + sizeInMB);

					event.target.value = "";
					totalImagesSize = imagesSize;
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

		// Check if there are files selected by the user.
		if (event.target.files[0]) {
			arrToUse = event.target.files; // Use the files selected by the user.
		} else {
			arrToUse = imagesPath; // Use the predefined images if no files are selected.
			usingOriginalImages = true; // Set the flag indicating that original images are being used.
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

		for (let i = 0; i < arrToUse.length; i++) {
			const image = arrToUse[i];
			const imageUrl = usingOriginalImages ? image : URL.createObjectURL(image);

			if (i == 0) {
				const articleMainImage = document.createElement("div");
				articleMainImage.id = "0";
				articleMainImage.classList.add("draggable-image");
				articleMainImage.style.backgroundImage = `url('${imageUrl}')`;
				articleMainImage.addEventListener("click", openImage);

				articleImageHolder.appendChild(articleMainImage);

				if (articleImageHolder.children[0]) {
					if (window.innerWidth > 1000 || window.innerWidth < 500) {
						articleImageHolder.style.width = "100%";
						articleImageHolder.style.height = "300px";
					} else {
						articleImageHolder.style.width = "420px";
						articleImageHolder.style.height = "300px";
					}
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

			drake.containers.push(smallImage);
		}
	});

	updateButton.addEventListener("click", async function (event) {
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

		//If the user have added an image.
		if (articleImages.files.length != 0) {
			await updateImageDir(); // Delete the old images or create the dir.
			await updateArticleImage(); // Save the images.
		} else if (articleImageHolder.children[0].id != 0) {
			await updateArticleImageNoChange(); // Save the images.
		} else {
			for (let i = 0; i < imagesPath.length - 1; i++) {
				if (smallImageWrapper.children[i].children[0].id != i + 1) {
					await updateArticleImageNoChange(); // Save the images.

					break;
				}
			}
		}

		await updateArticleData(); // Update the data of the artilce.

		// Redirect the user back to all articles.
		await redirectBack();
	});

	deleteButton.addEventListener("click", async function (event) {
		if (!confirm("You are about to delete this article! Please confirm.")) {
			return;
		}

		try {
			const response = await fetch("/deleteArticle", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: articleFormId.value }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);

			window.location.href = "/adminArticleView";
		} catch (error) {
			console.error("Error:", error.message);
		}
	});

	cancelButton.addEventListener("click", async function (event) {
		if (!confirm("You are about to cancle the changes to this article! Please confirm.")) {
			return;
		}

		window.location.href = "/adminArticleView";
	});

	async function updateImageDir() {
		try {
			const response = await fetch(`/updateArticleImageDir`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: articleFormId.value }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function updateArticleImage(areNewImages) {
		const formData = new FormData();

		const orderedList = [];

		orderedList.push(articleImageHolder.children[0].id);

		for (let i = 0; i < smallImageWrapper.children.length; i++) {
			orderedList.push(smallImageWrapper.children[i].children[0].id);
		}

		for (let i = 0; i < articleImages.files.length; i++) {
			formData.append("images", articleImages.files[orderedList[i]]);
		}

		formData.append("id", articleFormId.value);

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

	async function updateArticleImageNoChange() {
		const orderedList = [];

		orderedList.push(articleImageHolder.children[0].id);

		for (let i = 0; i < smallImageWrapper.children.length; i++) {
			orderedList.push(smallImageWrapper.children[i].children[0].id);
		}

		let paths = "";

		for (let i = 0; i < imagesPath.length; i++) {
			paths += imagesPath[orderedList[i]] + "|||";
		}

		paths += "|";

		try {
			const response = await fetch(`/updateArticleImageNoChange`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: articleFormId.value, imagesPath: paths }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function updateArticleData() {
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
			const response = await fetch(`/updateArticleData`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: articleFormId.value, title: articleTitle.value, content: articleContent.value.replaceAll("\n", "<br>"), description: articleDescription.value, date: transformedDate, keywords: articleKeywords.value }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
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
