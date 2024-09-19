const monthNames = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];

document.addEventListener("DOMContentLoaded", async function () {
	const form = document.getElementById("form");

	const projectTitle = document.getElementById("title");
	const projectContent = document.getElementById("project-content");
	const projectDescription = document.getElementById("description");
	const projectPublishDate = document.getElementById("date");
	const projectImages = document.getElementById("images");
	const projectFiles = document.getElementById("files");
	const projectImageHolder = document.getElementById("image-holder");
	const articleKeywords = document.getElementById("keywords");

	const cancelButton = document.getElementById("cancel-button");
	const addButton = document.getElementById("add-button");

	const smallImageWrapper = document.getElementById("small-images-wrapper");
	const imagesSizeLable = document.getElementById("image-size");

	const fileDisplay = document.getElementById("files-display");
	const filesSizeLable = document.getElementById("file-size");

	const content = document.getElementById("content");
	const buttons = document.getElementById("buttons");
	const contentBorders = document.getElementById("content-borders");
	const imagesLable = document.getElementById("images-lable");
	const imagesContent = document.getElementById("images-content");
	const filesLable = document.getElementById("files-lable");
	const filesWrapper = document.getElementById("files-wrapper");

	const maxImagesSize = 50 * 1024 * 1024; // limit: 50MB (5MB each, up to 10).
	const maxFilessSize = 150 * 1024 * 1024; // limit: 150MB (15MB each, up to 10).
	var totalImagesSize = 0;
	var totalFilesSize = 0;

	var projectId;

	if (window.innerWidth < 1000) {
		content.appendChild(buttons);
		contentBorders.insertBefore(imagesLable, contentBorders.children[1]);
		contentBorders.insertBefore(imagesSizeLable.parentNode, contentBorders.children[0]);
		contentBorders.insertBefore(filesLable, contentBorders.children[0]);
		contentBorders.insertBefore(filesWrapper, contentBorders.children[0]);
	}

	if (fileDisplay.children[0]) {
		fileDisplay.style.width = "calc(100% - 40px)";
		fileDisplay.style.borderWidth = "1px";
		fileDisplay.style.height = "fit-content";
	} else {
		if (window.innerWidth > 1000) {
			fileDisplay.style.borderWidth = "0";
			fileDisplay.style.height = "0px";
		} else {
			fileDisplay.style.borderWidth = "1px";
			fileDisplay.style.height = "45px";
		}
	}

	projectFiles.addEventListener("change", function (event) {
		totalFilesSize = 0;

		if (event.target.files.length > 10) {
			alert("You can not add more then 10 files");

			event.target.value = "";

			totalFilesSize = 0;
		} else {
			for (let i = 0; i < event.target.files.length; i++) {
				let size = event.target.files[i].size;

				totalFilesSize += size;

				let sizeInMB = parseFloat(size / (1024 * 1024)).toFixed(2);
				if (sizeInMB > 15) {
					alert("One file cannot be more then 15MB! The file with name " + event.target.files[i].name + " is " + sizeInMB);

					event.target.value = "";
					totalFilesSize = 0;
				}
			}
		}

		let totalImageSizeRounded = (totalFilesSize / (1024 * 1024)).toFixed(2);

		filesSizeLable.innerHTML = `${totalImageSizeRounded}MB / 150MB`;

		if (totalFilesSize > maxFilessSize) {
			filesSizeLable.style.color = "red";
		} else {
			filesSizeLable.style.color = "black";
		}

		// Iterate backwards to avoid skipping elements due to changes in the children list.
		for (let i = fileDisplay.children.length - 1; i >= 0; i--) {
			const element = fileDisplay.children[i];
			fileDisplay.removeChild(element);
		}

		var drake;
		if (event.target.files[0]) {
			for (let i = 0; i < event.target.files.length; i++) {
				const file = event.target.files[i];
				const fileUrl = URL.createObjectURL(file);

				var fileDiv = document.createElement("div");
				fileDiv.id = i;
				fileDiv.classList.add("draggable-file");
				fileDiv.innerHTML = file.name;

				fileDiv.addEventListener("click", function (event) {
					window.open(fileUrl, "_blank");
				});

				fileDisplay.appendChild(fileDiv);
			}

			drake = dragula([document.getElementById("files-display")], {
				moves: function (el, container, handle) {
					return handle.classList.contains("draggable-file");
				},
			});

			drake.on("drag", function (el, source) {
				document.body.style.overflow = "hidden";
			});

			drake.on("cancel", function (el, source, sibling) {
				el.style.display = "block";
				document.body.style.overflow = "visible";
			});

			drake.on("drop", function (el, target, source, sibling) {
				if (sibling) {
					target.insertBefore(el, sibling);
				} else {
					target.appendChild(el);
				}
				document.body.style.overflow = "visible";
			});
		}

		if (fileDisplay.children[0]) {
			fileDisplay.style.width = "calc(100% - 40px)";
			fileDisplay.style.borderWidth = "1px";
			fileDisplay.style.height = "fit-content";
		} else {
			if (window.innerWidth > 1000) {
				fileDisplay.style.borderWidth = "0";
				fileDisplay.style.height = "0px";
			} else {
				fileDisplay.style.borderWidth = "1px";
				fileDisplay.style.height = "45px";
			}
		}
	});

	projectImages.addEventListener("change", function (event) {
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

		var totalImageSizeRounded = (totalImagesSize / (1024 * 1024)).toFixed(2);

		imagesSizeLable.innerHTML = `${totalImageSizeRounded}MB / 50MB`;

		if (totalImagesSize > maxImagesSize) {
			imagesSizeLable.style.color = "red";
		} else {
			imagesSizeLable.style.color = "black";
		}

		if (projectImageHolder.children[0]) {
			projectImageHolder.removeChild(projectImageHolder.children[0]);

			projectImageHolder.style.width = "0";
			projectImageHolder.style.height = "0";
		}

		// Iterate backwards to avoid skipping elements due to changes in the children list.
		for (let i = smallImageWrapper.children.length - 1; i >= 0; i--) {
			const element = smallImageWrapper.children[i];
			smallImageWrapper.removeChild(element);
		}

		var drake;
		if (event.target.files[0]) {
			for (let i = 0; i < event.target.files.length; i++) {
				const image = event.target.files[i];
				const imageUrl = URL.createObjectURL(image);

				if (i == 0) {
					var projectMainImage = document.createElement("div");
					projectMainImage.id = "0";
					projectMainImage.classList.add("draggable-image");
					projectMainImage.style.backgroundImage = `url('${imageUrl}')`;
					projectMainImage.addEventListener("click", openImage);

					projectImageHolder.appendChild(projectMainImage);

					if (window.innerWidth > 1000 || window.innerWidth < 500) {
						projectImageHolder.style.width = "100%";
						projectImageHolder.style.height = "300px";
					} else {
						projectImageHolder.style.width = "420px";
						projectImageHolder.style.height = "300px";
					}

					continue;
				}

				var smallImage = document.createElement("div");
				smallImage.classList.add("small-preview");
				smallImage.classList.add("image-container");

				var draggableImage = document.createElement("div");
				draggableImage.id = i;
				draggableImage.classList.add("draggable-image");
				draggableImage.style.backgroundImage = `url('${imageUrl}')`;
				draggableImage.addEventListener("click", openImage);

				smallImage.appendChild(draggableImage);
				smallImageWrapper.appendChild(smallImage);
			}

			drake = dragula(Array.from(document.getElementsByClassName("image-container")), {
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
		if (!projectTitle.value) {
			alert("Title is required");
			return;
		}

		// No content added.
		if (!projectContent.value) {
			alert("Content is required");
			return;
		}

		// No image added.
		if (!projectImages.files[0]) {
			alert("Image is required");
			return;
		}

		// No date added.
		if (!projectPublishDate.value) {
			alert("Date is required");
			return;
		}

		// The added images are too big.
		if (totalImagesSize > maxImagesSize) {
			alert("The total size of the selected files exceeds the 50 MB limit.");
			return;
		}

		await createProject(); // Inserts the project into the database.

		await createImageDir(); // Create the images dir.
		await saveProjectImage(); // Save the images.

		await createFileDir(); // Create the files dir.
		await saveProjectFile(); // Save the files.

		await redirectBack();
	});

	cancelButton.addEventListener("click", async function (event) {
		if (!confirm("You are about to cancle the creation to this project! Please confirm.")) {
			return;
		}

		await redirectBack();
	});

	async function createImageDir() {
		try {
			const response = await fetch(`/updateProjectImageDir`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: projectId }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function saveProjectImage() {
		const formData = new FormData();

		const orderedList = [];

		orderedList.push(projectImageHolder.children[0].id);

		for (let i = 0; i < smallImageWrapper.children.length; i++) {
			orderedList.push(smallImageWrapper.children[i].children[0].id);
		}

		for (let i = 0; i < projectImages.files.length; i++) {
			formData.append("images", projectImages.files[orderedList[i]]);
		}

		formData.append("id", projectId);

		try {
			const response = await fetch(`/updateProjectImage`, {
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

	async function createFileDir() {
		try {
			const response = await fetch(`/updateProjectFileDir`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: projectId }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function saveProjectFile() {
		const formData = new FormData();

		const orderedList = [];

		for (let i = 0; i < fileDisplay.children.length; i++) {
			orderedList.push(fileDisplay.children[i].id);
		}

		for (let i = 0; i < projectFiles.files.length; i++) {
			formData.append("files", projectFiles.files[orderedList[i]]);
		}

		formData.append("id", projectId);

		try {
			const response = await fetch(`/updateProjectFile`, {
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

	async function createProject() {
		let date = new Date(projectPublishDate.value);

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
			const response = await fetch(`/createProject`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title: projectTitle.value, content: projectContent.value.replaceAll("\n", "<br>"), description: projectDescription.value, date: transformedDate, keywords: articleKeywords.value }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const data = await response.json();
			projectId = data.id;

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function redirectBack() {
		try {
			const response = await fetch("/loadadminProjectView", { method: "post" });
			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.json();

			window.location.href = result.redirectUrl;
		} catch (error) {
			console.error("Error fetching projects:", error);
		}
	}

	window.addEventListener("resize", function (event) {
		if (projectImageHolder.children[0]) {
			if (window.innerWidth > 1000 || window.innerWidth < 500) {
				projectImageHolder.style.width = "100%";
				projectImageHolder.style.height = "300px";
			} else {
				projectImageHolder.style.width = "420px";
				projectImageHolder.style.height = "300px";
			}
		}

		if (fileDisplay.children[0]) {
			fileDisplay.style.width = "calc(100% - 40px)";
			fileDisplay.style.borderWidth = "1px";
			fileDisplay.style.height = "fit-content";
		} else {
			if (window.innerWidth > 1000) {
				fileDisplay.style.borderWidth = "0";
				fileDisplay.style.height = "0px";
			} else {
				fileDisplay.style.borderWidth = "1px";
				fileDisplay.style.height = "45px";
			}
		}

		if (window.innerWidth < 1000) {
			content.appendChild(buttons);
			contentBorders.insertBefore(imagesLable, contentBorders.children[4]);
			contentBorders.insertBefore(imagesSizeLable.parentNode, contentBorders.children[0]);
			contentBorders.insertBefore(filesLable, contentBorders.children[0]);
			contentBorders.insertBefore(filesWrapper, contentBorders.children[0]);
		} else {
			form.appendChild(buttons);
			imagesContent.insertBefore(imagesLable, imagesContent.firstChild);
			imagesContent.appendChild(imagesSizeLable.parentNode);
			imagesContent.appendChild(filesWrapper);
			filesWrapper.insertBefore(filesLable, filesWrapper.firstChild);
		}
	});
});
