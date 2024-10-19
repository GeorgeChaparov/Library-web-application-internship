const monthNames = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];

const projectsArray = [];

document.addEventListener("DOMContentLoaded", async function () {
	const projectsListDiv = document.getElementById("projects");

	try {
		const response = await fetch("/getProjects");
		if (!response.ok) throw new Error("Network response was not ok");

		const projects = await response.json();

		projects.reverse();
		projects.forEach((project) => {
			const projectWrapperDiv = document.createElement("div");
			projectWrapperDiv.classList.add("project-wrapper");
			projectWrapperDiv.id = project.id;

			const projectWindowDiv = document.createElement("div");
			projectWindowDiv.classList.add("project-window");

			let image_path;

			let count = 0;
			for (let i = 0; i < project.image_path.length; i++) {
				const char = project.image_path.charAt(i);

				if (count === 3) {
					image_path = project.image_path.slice(0, i - 3);
					break;
				}

				if (char === "|") {
					++count;
				} else {
					count = 0;
					continue;
				}
			}

			const projectImageDiv = document.createElement("div");
			projectImageDiv.classList.add("project-image");
			projectImageDiv.style.backgroundImage = `url("${image_path}")`;

			if (isAdminView) {
				const idDiv = document.createElement("div");
				idDiv.classList.add("project-id");
				idDiv.innerHTML = project.id;

				projectImageDiv.appendChild(idDiv);
			}

			const projectTitleAndDescriptionWrapper = document.createElement("div");
			projectTitleAndDescriptionWrapper.classList.add("project-title-and-description-wrapper");

			const projectTitle = document.createElement("div");
			projectTitle.classList.add("project-title");
			projectTitle.classList.add("montserrat-for-titles");
			projectTitle.innerHTML = project.title;

			const projectDescription = document.createElement("div");
			projectDescription.classList.add("project-description");
			projectDescription.classList.add("wix-madefor-display-for-long-text");
			projectDescription.innerHTML = project.description;

			const projectDate = document.createElement("div");
			projectDate.classList.add("project-date");
			projectDate.innerHTML = project.upload_date;

			projectTitleAndDescriptionWrapper.appendChild(projectTitle);
			projectTitleAndDescriptionWrapper.appendChild(projectDescription);

			projectWindowDiv.appendChild(projectImageDiv);
			projectWindowDiv.appendChild(projectTitleAndDescriptionWrapper);
			projectWindowDiv.appendChild(projectDate);
			projectWrapperDiv.appendChild(projectWindowDiv);

			projectsListDiv.appendChild(projectWrapperDiv);

			projectWrapperDiv.addEventListener("click", async function () {
				sessionStorage.setItem("id", this.id);

				if (isAdminView) {
					// Redirect the user to the edit project form.
					try {
						const response = await fetch("/loadEditProjectView", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching projects:", error);
					}
				} else {
					try {
						const response = await fetch("/loadViewProject", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching projects:", error);
					}
				}
			});

			projectsArray.push(projectWrapperDiv);
		});
	} catch (error) {
		console.error("Error fetching projects:", error);
	}
});
