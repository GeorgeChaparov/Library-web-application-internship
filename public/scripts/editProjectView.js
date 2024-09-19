const monthNames = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];

document.addEventListener("DOMContentLoaded", async function () {
	const form = document.getElementById("form");

	const projectFormId = document.getElementById("id");
	const projectTitle = document.getElementById("title");
	const projectContent = document.getElementById("project-content");
	const projectDescription = document.getElementById("description");
	const projectPublishDate = document.getElementById("date");
	const projectImages = document.getElementById("images");
	const projectFiles = document.getElementById("files");
	const projectImageHolder = document.getElementById("image-holder");
	const articleKeywords = document.getElementById("keywords");

	const deleteButton = document.getElementById("delete-button");
	const cancelButton = document.getElementById("cancel-button");
	const updateButton = document.getElementById("update-button");

	const smallImageWrapper = document.getElementById("small-images-wrapper");
	const imageSizeLable = document.getElementById("image-size");

	const fileDisplay = document.getElementById("files-display");
	const filesSizeLable = document.getElementById("file-size");

	const content = document.getElementById("content");
	const buttons = document.getElementById("buttons");
	const contentBorders = document.getElementById("content-borders");
	const imagesLable = document.getElementById("images-lable");
	const imagesContent = document.getElementById("images-content");
	const filesLable = document.getElementById("files-lable");
	const filesWrapper = document.getElementById("files-wrapper");

	const maxImagesSize = 150 * 1024 * 1024; // limit: 150MB (15MB each, up to 10).
	const maxFilessSize = 150 * 1024 * 1024; // limit: 150MB (15MB each, up to 10).

	var totalImagesSize = 0;
	var totalFilesSize = 0;

	var imagesPath = [];
	var documentsPath = [];

	var imagesSize = 0;
	var filesSize = 0;

	if (window.innerWidth < 1000) {
		content.appendChild(buttons);
		contentBorders.insertBefore(imagesLable, contentBorders.children[1]);
		contentBorders.insertBefore(imageSizeLable.parentNode, contentBorders.children[0]);
		contentBorders.insertBefore(filesLable, contentBorders.children[0]);
		contentBorders.insertBefore(filesWrapper, contentBorders.children[0]);
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

		var count = 0;
		var lastEndIndex = 0;
		for (let i = 0; i < project.image_path.length; i++) {
			const char = project.image_path.charAt(i);

			if (count === 3) {
				imagesPath.push(project.image_path.slice(lastEndIndex, i - 3));
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
			const response = await fetch(`/getImageSize`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ image_path: imagesPath[0] }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const imageSize = await response.json();

			totalImagesSize += imageSize;
		} catch (err) {
			console.error(err);
		}

		var projectMainImage = document.createElement("div");
		projectMainImage.id = "0";
		projectMainImage.classList.add("draggable-image");
		projectMainImage.style.backgroundImage = "url('" + imagesPath[0] + "')";
		projectMainImage.addEventListener("click", openImage);

		projectImageHolder.appendChild(projectMainImage);

		if (window.innerWidth > 1000 || window.innerWidth < 500) {
			projectImageHolder.style.width = "100%";
			projectImageHolder.style.height = "300px";
		} else {
			projectImageHolder.style.width = "420px";
			projectImageHolder.style.height = "300px";
		}

		for (let i = 1; i < imagesPath.length; i++) {
			const path = imagesPath[i];

			try {
				const response = await fetch(`/getImageSize`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ image_path: imagesPath[i] }),
				});

				if (!response.ok) throw new Error("Network response was not ok");

				const imageSize = await response.json();

				totalImagesSize += imageSize;
			} catch (err) {
				console.error(err);
			}

			const image = imagesPath[i];

			var smallImage = document.createElement("div");
			smallImage.classList.add("small-preview");
			smallImage.classList.add("image-container");

			var draggableImage = document.createElement("div");
			draggableImage.id = i;
			draggableImage.classList.add("draggable-image");
			draggableImage.style.backgroundImage = "url('" + image + "')";
			draggableImage.addEventListener("click", openImage);

			smallImage.appendChild(draggableImage);
			smallImageWrapper.appendChild(smallImage);
		}

		imagesSize = totalImagesSize;

		var totalFileSizeRounded = (totalImagesSize / (1024 * 1024)).toFixed(2);

		imageSizeLable.innerHTML = `${totalFileSizeRounded}MB / 50MB`;

		count = 0;
		lastEndIndex = 0;

		for (let i = 0; i < project.document_path.length; i++) {
			const char = project.document_path.charAt(i);

			if (count === 3) {
				const fileUrl = project.document_path.slice(lastEndIndex, i - 3);
				documentsPath.push(fileUrl);

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

		for (let i = 0; i < documentsPath.length; i++) {
			const fileUrl = documentsPath[i];
			const fileName = fileUrl.slice(fileUrl.lastIndexOf("/") + 1);

			var fileDiv = document.createElement("div");
			fileDiv.id = i;
			fileDiv.classList.add("draggable-file");

			if (window.innerWidth > 1000) {
				if (fileName.length > 30) {
					fileDiv.innerHTML = fileName.slice(0, 30) + "...";
				} else {
					fileDiv.innerHTML = fileName;
				}
			} else {
				fileDiv.innerHTML = fileName;
			}

			fileDiv.addEventListener("click", function (event) {
				window.open(fileUrl, "_blank");
			});

			fileDisplay.appendChild(fileDiv);

			try {
				const response = await fetch(`/getImageSize`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ image_path: fileUrl }),
				});

				if (!response.ok) throw new Error("Network response was not ok");

				const fileSize = await response.json();

				totalFilesSize += fileSize;
			} catch (err) {
				console.error(err);
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

		filesSize = totalFilesSize;

		var totalFileSizeRounded = (totalFilesSize / (1024 * 1024)).toFixed(2);

		filesSizeLable.innerHTML = `${totalFileSizeRounded}MB / 150MB`;

		let comma = project.upload_date.indexOf(",");

		let dateYear = project.upload_date.slice(comma + 2);
		let dateMonth = project.upload_date.slice(3, comma);
		let dateDay = project.upload_date.slice(0, 2);

		const month = monthNames.findIndex((month) => month.toLowerCase() === dateMonth.toLowerCase());

		let transformedDate = "";

		if (month > 9) {
			transformedDate = `${dateYear}-${month + 1}-${dateDay}`;
		} else {
			transformedDate = `${dateYear}-0${month + 1}-${dateDay}`;
		}

		projectFormId.value = project.id;
		projectTitle.value = project.title;
		projectPublishDate.value = transformedDate;
		projectContent.value = project.content.replaceAll("<br>", "\n");
		projectDescription.value = project.description;
		articleKeywords.value = project.keywords;

		var fileDrake = dragula([document.getElementById("files-display")], {
			moves: function (el, container, handle) {
				return handle.classList.contains("draggable-file");
			},
		});

		fileDrake.on("drag", function (el, source) {
			document.body.style.overflow = "hidden";
		});

		fileDrake.on("cancel", function (el, source, sibling) {
			el.style.display = "block";
			document.body.style.overflow = "visible";
		});

		fileDrake.on("drop", function (el, target, source, sibling) {
			if (sibling) {
				target.insertBefore(el, sibling);
			} else {
				target.appendChild(el);
			}
			document.body.style.overflow = "visible";
		});

		var imageDrake = dragula(Array.from(document.getElementsByClassName("image-container")), {
			moves: function (el, container, handle) {
				return handle.classList.contains("draggable-image");
			},
		});

		imageDrake.on("drag", function (el, source) {
			document.body.style.overflow = "hidden";
		});

		imageDrake.on("over", function (el, container, source) {
			for (let i = 0; i < container.children.length; i++) {
				const element = container.children[i];

				if (element.classList.value.includes("gu-transit")) {
					element.style.display = "none";
				}
			}
		});

		imageDrake.on("cancel", function (el, source, sibling) {
			el.style.display = "block";
			document.body.style.overflow = "visible";
		});

		imageDrake.on("drop", function (el, target, source, sibling) {
			target.appendChild(el);
			source.appendChild(target.children[0]);
			el.style.display = "block";
			document.body.style.overflow = "visible";
		});
	} catch (error) {
		console.error("Error fetching project:", error);
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
		var arrToUse; // Array from which the files will be taken.
		var usingOriginalFiles = false; // Flag to check if original files are being used.

		totalFilesSize = 0;

		if (event.target.files.length > 10) {
			alert("You can not add more then 10 files");

			event.target.value = "";
			totalFilesSize = filesSize;
		} else {
			for (let i = 0; i < event.target.files.length; i++) {
				let size = event.target.files[i].size;

				totalFilesSize += size;

				let sizeInMB = parseFloat(size / (1024 * 1024)).toFixed(2);
				if (sizeInMB > 15) {
					alert("One file cannot be more then 15MB! File with name " + event.target.files[i].name + " is " + sizeInMB);

					event.target.value = "";
					totalFilesSize = filesSize;
				}
			}
		}

		var totalFileSizeRounded = (totalFilesSize / (1024 * 1024)).toFixed(2);

		filesSizeLable.innerHTML = `${totalFileSizeRounded}MB / 150MB`;

		if (totalFilesSize > maxFilessSize) {
			filesSizeLable.style.color = "red";
		} else {
			filesSizeLable.style.color = "black";
		}

		// Check if there are files selected by the user.
		if (event.target.files[0]) {
			arrToUse = event.target.files; // Use the files selected by the user.
		} else {
			arrToUse = documentsPath; // Use the predefined files if no files are selected.
			usingOriginalFiles = true; // Set the flag indicating that original files are being used.
		}

		// Iterate backwards to avoid skipping elements due to changes in the children list.
		for (let i = fileDisplay.children.length - 1; i >= 0; i--) {
			const element = fileDisplay.children[i];
			fileDisplay.removeChild(element);
		}

		for (let i = 0; i < arrToUse.length; i++) {
			const file = arrToUse[i];
			const fileUrl = usingOriginalFiles ? file : URL.createObjectURL(file);

			var fileDiv = document.createElement("div");
			fileDiv.id = i;
			fileDiv.classList.add("draggable-file");
			fileDiv.innerHTML = usingOriginalFiles ? file.slice(file.lastIndexOf("/") + 1) : file.name.slice(file.name.lastIndexOf("/") + 1);

			fileDiv.addEventListener("click", function (event) {
				window.open(fileUrl, "_blank");
			});

			fileDisplay.appendChild(fileDiv);
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
		var arrToUse; // Array from which the images will be taken.
		var usingOriginalImages = false; // Flag to check if original images are being used.

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

		var totalImageSizeRounded = (totalImagesSize / (1024 * 1024)).toFixed(2);

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

		for (let i = 0; i < arrToUse.length; i++) {
			const image = arrToUse[i];
			const imageUrl = usingOriginalImages ? image : URL.createObjectURL(image);

			if (i == 0) {
				var projectMainImage = document.createElement("div");
				projectMainImage.id = "0";
				projectMainImage.classList.add("draggable-image");
				projectMainImage.style.backgroundImage = `url('${imageUrl}')`;
				projectMainImage.addEventListener("click", openImage);

				projectImageHolder.appendChild(projectMainImage);

				if (projectImageHolder.children[0]) {
					if (window.innerWidth > 1000 || window.innerWidth < 500) {
						projectImageHolder.style.width = "100%";
						projectImageHolder.style.height = "300px";
					} else {
						projectImageHolder.style.width = "420px";
						projectImageHolder.style.height = "300px";
					}
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

			imageDrake.containers.push(smallImage);
		}
	});

	updateButton.addEventListener("click", async function (event) {
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

		// No date added.
		if (!projectPublishDate.value) {
			alert("Date is required");
			return;
		}

		// The added images are too big.
		if (totalImagesSize > maxImagesSize) {
			alert("The total size of the selected images exceeds the 50MB limit.");
			return;
		}

		//If the user have added an image.
		if (projectImages.files.length != 0) {
			await updateImageDir(); // Delete the old images or create the dir.
			await updateProjectImage(); // Save the images.
		} else if (projectImageHolder.children[0].id != 0) {
			await updateProjectImageNoChange(); // Save the images.
		} else {
			for (let i = 0; i < imagesPath.length - 1; i++) {
				if (smallImageWrapper.children[i].children[0].id != i + 1) {
					await updateProjectImageNoChange(); // Save the images.

					break;
				}
			}
		}

		//If the user have added an file.
		if (projectFiles.files.length != 0) {
			await updateFileDir(); // Delete the old files or create the dir.
			await updateProjectFile(); // Save the files.
		} else {
			for (let i = 0; i < documentsPath.length - 1; i++) {
				if (fileDisplay.children[i].id != i) {
					await updateProjectFileNoChange(); // Save the files.

					break;
				}
			}
		}

		await updateProjectData(); // Update the data of the artilce.

		// Redirect the user back to all projects.
		await redirectBack();
	});

	deleteButton.addEventListener("click", async function (event) {
		if (!confirm("You are about to delete this project! Please confirm.")) {
			return;
		}

		try {
			const response = await fetch("/deleteProject", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: projectFormId.value }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);

			await redirectBack();
		} catch (error) {
			console.error("Error:", error.message);
		}
	});

	cancelButton.addEventListener("click", async function (event) {
		if (!confirm("You are about to cancle the changes to this project! Please confirm.")) {
			return;
		}

		await redirectBack();
	});

	async function updateImageDir() {
		try {
			const response = await fetch(`/updateProjectImageDir`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: projectFormId.value }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function updateFileDir() {
		try {
			const response = await fetch(`/updateProjectFileDir`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: projectFormId.value }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function updateProjectImage() {
		const formData = new FormData();

		const orderedList = [];

		orderedList.push(projectImageHolder.children[0].id);

		for (let i = 0; i < smallImageWrapper.children.length; i++) {
			orderedList.push(smallImageWrapper.children[i].children[0].id);
		}

		for (let i = 0; i < projectImages.files.length; i++) {
			formData.append("images", projectImages.files[orderedList[i]]);
		}

		formData.append("id", projectFormId.value);

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

	async function updateProjectFile() {
		const formData = new FormData();

		const orderedList = [];

		for (let i = 0; i < fileDisplay.children.length; i++) {
			orderedList.push(fileDisplay.children[i].id);
		}

		for (let i = 0; i < projectFiles.files.length; i++) {
			formData.append("files", projectFiles.files[orderedList[i]]);
		}

		formData.append("id", projectFormId.value);

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

	async function updateProjectImageNoChange() {
		const orderedList = [];

		orderedList.push(projectImageHolder.children[0].id);

		for (let i = 0; i < smallImageWrapper.children.length; i++) {
			orderedList.push(smallImageWrapper.children[i].children[0].id);
		}

		var paths = "";

		for (let i = 0; i < imagesPath.length; i++) {
			paths += imagesPath[orderedList[i]] + "|||";
		}

		paths += "|";

		try {
			const response = await fetch(`/updateProjectImageNoChange`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: projectFormId.value, imagesPath: paths }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function updateProjectFileNoChange() {
		const orderedList = [];

		for (let i = 0; i < fileDisplay.children.length; i++) {
			orderedList.push(fileDisplay.children[i].id);
		}

		var paths = "";

		for (let i = 0; i < documentsPath.length; i++) {
			paths += documentsPath[orderedList[i]] + "|||";
		}

		paths += "|";

		try {
			const response = await fetch(`/updateProjectFileNoChange`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: projectFormId.value, filesPath: paths }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.text();
			console.log(result);
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async function updateProjectData() {
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
			const response = await fetch(`/updateProjectData`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: projectFormId.value, title: projectTitle.value, content: projectContent.value.replaceAll("\n", "<br>"), description: projectDescription.value, date: transformedDate, keywords: articleKeywords.value }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

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

		if (window.innerWidth < 1000) {
			content.appendChild(buttons);
			contentBorders.insertBefore(imagesLable, contentBorders.children[4]);
			contentBorders.insertBefore(imageSizeLable.parentNode, contentBorders.children[0]);
			contentBorders.insertBefore(filesLable, contentBorders.children[0]);
			contentBorders.insertBefore(filesWrapper, contentBorders.children[0]);
		} else {
			form.appendChild(buttons);
			imagesContent.insertBefore(imagesLable, imagesContent.firstChild);
			imagesContent.appendChild(imageSizeLable.parentNode);
			imagesContent.appendChild(filesWrapper);
			filesWrapper.insertBefore(filesLable, filesWrapper.firstChild);
		}
	});
});
