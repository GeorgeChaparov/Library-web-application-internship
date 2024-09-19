var rect;
var elementWidth;
var elementHeight;
var bigImageBackground;

const openImage = function (event) {
	rect = event.target.getBoundingClientRect();

	removeKeyframeStyle("show-animation");

	elementWidth = event.target.clientWidth;
	elementHeight = event.target.clientHeight;

	const showKeyframes =
		`
			@keyframes show-big-image-background-animation {
 
			    0%{
					background-color: rgba(0, 0, 0, 0);

			        width: ` +
		elementWidth +
		`px;
				    height: ` +
		elementHeight +
		`px;

			        left: ` +
		rect.left +
		`px;
			        top: ` +
		rect.top +
		`px;
			            }

				75%{
				   	background-color: rgba(0, 0, 0, 0);

					left: 0vw;
					top: 0vh;

					width: 100vw;
					height: 100vh;
				}

				100% {
					background-color: rgba(0, 0, 0, 0.584);
					
					left: 0vw;
					top: 0vh;

					width: 100vw;
					height: 100vh;
			    }
	 		}`;
	const styleElement = document.createElement("style");
	styleElement.textContent = showKeyframes;
	styleElement.id = "show-animation";
	document.head.appendChild(styleElement);

	var backgroundImage;

	if (event.target.style.backgroundImage) {
		backgroundImage = event.target.style.backgroundImage;
	} else {
		backgroundImage = "url('" + event.target.src + "')";
	}
	var imageStyle = bigImageBackground.children[0].style;

	imageStyle.backgroundImage = backgroundImage;

	bigImageBackground.style.animation = "show-big-image-background-animation 1s ease-out 0s forwards";

	document.body.style.overflow = "hidden";
};

const closeImage = function () {
	removeKeyframeStyle("hide-animation");

	var bigImageRect = bigImageBackground.getBoundingClientRect();

	const hideKeyframes =
		`
			@keyframes hide-big-image-background-animation {
			0% {
				background-color: rgba(0, 0, 0, 0.584);

					left: ` +
		bigImageRect.left +
		`px;
		            top: ` +
		bigImageRect.top +
		`px;

		            width: ` +
		bigImageBackground.clientWidth +
		`px;
		            height: ` +
		bigImageBackground.clientHeight +
		`px;
		    }

			25%{
				background-color: rgba(0, 0, 0, 0);

					left: ` +
		bigImageRect.left +
		`px;
		            top: ` +
		bigImageRect.top +
		`px;

		            width: ` +
		bigImageBackground.clientWidth +
		`px;
		            height: ` +
		bigImageBackground.clientHeight +
		`px;
			}

				75%{
			       opacity: 100%;
			        }

			    99%{
			       width: ` +
		elementWidth +
		`px;
				    height: ` +
		elementHeight +
		`px;
			        }

				100% {
					background-color: rgba(0, 0, 0, 0);

					opacity: 0%;

			        width: 0;
				    height: 0;

			        left: ` +
		rect.left +
		`px;
			        top: ` +
		rect.top +
		`px;
			        }`;

	const styleElement = document.createElement("style");
	styleElement.textContent = hideKeyframes;
	styleElement.id = "hide-animation";
	document.head.appendChild(styleElement);

	bigImageBackground.style.animation = "hide-big-image-background-animation 0.8s ease-out 0s forwards";

	document.body.style.overflow = "";
};

function removeKeyframeStyle(styleId) {
	const stylesheet = document.getElementById(styleId);
	if (stylesheet) {
		stylesheet.parentNode.removeChild(stylesheet);
	} else {
		console.warn("Stylesheet not found or already removed.");
	}
}

document.addEventListener("DOMContentLoaded", async function () {
	const logos = document.getElementsByClassName("logo");
	const selectedButtons = document.getElementsByClassName("selected-button");
	const pressableButtons = document.getElementsByClassName("pressable-button");
	const homeButtons = document.getElementsByClassName("home-button");
	const newsButtons = document.getElementsByClassName("news-button");
	const projectsButtons = document.getElementsByClassName("projects-button");
	const aboutButtons = document.getElementsByClassName("about-button");
	const contactsButtons = document.getElementsByClassName("contacts-button");
	const adminNewsButtons = document.getElementsByClassName("admin-news-button");
	const createNewsButtons = document.getElementsByClassName("create-news-button");
	const adminProjectsButtons = document.getElementsByClassName("admin-projects-button");
	const createProjectsButtons = document.getElementsByClassName("create-projects-button");

	const menuButton = document.getElementById("menu");
	const floatingMenu = document.getElementById("floating-menu");

	const goUpButton = document.getElementById("go-up-button");

	const emailButton = document.getElementById("email-pictogram");
	const facebookButton = document.getElementById("facebook-pictogram");
	const instagramButton = document.getElementById("instagram-pictogram");

	var headerPressableButtons = [];
	var menuPressableButtons = [];
	var footerPressableButtons = [];

	var buttonCount = 0;

	if (!createNewsButtons[0]) {
		buttonCount = 4;
	} else {
		buttonCount = 3;
	}

	for (let i = 0; i < buttonCount; i++) {
		headerPressableButtons.push(pressableButtons[i]);
		menuPressableButtons.push(pressableButtons[i + buttonCount]);
		footerPressableButtons.push(pressableButtons[i + buttonCount * 2]);
	}

	goUpButton.addEventListener("click", function (event) {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	});

	bigImageBackground = document.getElementById("big_image_backbround");

	if (bigImageBackground) {
		bigImageBackground.addEventListener("click", closeImage);
	}

	if (selectedButtons[0]) {
		selectedButtons[0].style.backgroundColor = "rgba(188, 161, 112, 0.584)";

		if (selectedButtons[2]) {
			selectedButtons[2].style.backgroundColor = "rgb(135, 122, 101)";
		}

		for (let i = 0; i < selectedButtons.length; i++) {
			const button = selectedButtons[i];

			button.style.transform = "scale(1.1, 1.1)";
		}
	}

	if (selectedButtons[0]) {
		for (let i = 0; i < buttonCount; i++) {
			const headerButton = headerPressableButtons[i];
			const menuButton = menuPressableButtons[i];
			const footerButton = footerPressableButtons[i];

			headerButton.addEventListener("mouseover", function (event) {
				selectedButtons[0].style.backgroundColor = "transparent";
				selectedButtons[0].style.transform = "scale(1, 1)";
			});

			headerButton.addEventListener("mouseout", function (event) {
				selectedButtons[0].style.backgroundColor = "rgba(188, 161, 112, 0.584)";
				selectedButtons[0].style.transform = "scale(1.1, 1.1)";
			});

			menuButton.addEventListener("mouseover", function (event) {
				selectedButtons[1].style.backgroundColor = "transparent";
				selectedButtons[1].style.transform = "scale(1, 1)";
			});

			menuButton.addEventListener("mouseout", function (event) {
				selectedButtons[1].style.backgroundColor = "rgba(188, 161, 112, 0.584)";
				selectedButtons[1].style.transform = "scale(1.1, 1.1)";
			});

			footerButton.addEventListener("mouseover", function (event) {
				selectedButtons[2].style.backgroundColor = "transparent";
				selectedButtons[2].style.transform = "scale(1, 1)";
			});

			footerButton.addEventListener("mouseout", function (event) {
				selectedButtons[2].style.backgroundColor = "rgb(135, 122, 101)";
				selectedButtons[2].style.transform = "scale(1.1, 1.1)";
			});
		}
	}

	if (logos[0]) {
		for (let i = 0; i < logos.length; i++) {
			const logo = logos[i];

			logo.addEventListener("click", async function (event) {
				try {
					const response = await fetch("/loadHome", { method: "post" });
					if (!response.ok) throw new Error("Network response was not ok");

					const result = await response.json();

					window.location.href = result.redirectUrl;
				} catch (error) {
					console.error("Error fetching articles:", error);
				}
			});
		}
	}

	if (homeButtons[0]) {
		if (!homeButtons[0].classList.value.includes("selected-button")) {
			for (let i = 0; i < homeButtons.length; i++) {
				const button = homeButtons[i];

				button.addEventListener("click", async function (event) {
					try {
						const response = await fetch("/loadHome", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				});
			}
		}
	}

	if (newsButtons[0]) {
		if (!newsButtons[0].classList.value.includes("selected-button")) {
			for (let i = 0; i < newsButtons.length; i++) {
				const button = newsButtons[i];

				button.addEventListener("click", async function (event) {
					try {
						const response = await fetch("/loadArticlesView", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				});
			}
		}
	}

	if (projectsButtons[0]) {
		if (!projectsButtons[0].classList.value.includes("selected-button")) {
			for (let i = 0; i < projectsButtons.length; i++) {
				const button = projectsButtons[i];

				button.addEventListener("click", async function (event) {
					try {
						const response = await fetch("/loadProjectsView", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching projects:", error);
					}
				});
			}
		}
	}

	if (aboutButtons[0]) {
		if (!aboutButtons[0].classList.value.includes("selected-button")) {
			for (let i = 0; i < aboutButtons.length; i++) {
				const button = aboutButtons[i];

				button.addEventListener("click", async function (event) {
					try {
						const response = await fetch("/loadAbout", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				});
			}
		}
	}

	if (contactsButtons[0]) {
		if (!contactsButtons[0].classList.value.includes("selected-button")) {
			for (let i = 0; i < contactsButtons.length; i++) {
				const button = contactsButtons[i];

				button.addEventListener("click", async function (event) {
					try {
						const response = await fetch("/loadContacts", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				});
			}
		}
	}

	if (adminNewsButtons[0]) {
		if (!adminNewsButtons[0].classList.value.includes("selected-button")) {
			for (let i = 0; i < adminNewsButtons.length; i++) {
				const button = adminNewsButtons[i];

				button.addEventListener("click", async function (event) {
					try {
						const response = await fetch("/loadAdminArticleView", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				});
			}
		}
	}

	if (createNewsButtons[0]) {
		if (!createNewsButtons[0].classList.value.includes("selected-button")) {
			for (let i = 0; i < createNewsButtons.length; i++) {
				const button = createNewsButtons[i];

				button.addEventListener("click", async function (event) {
					// Redirect the user to the create article form.
					try {
						const response = await fetch("/loadCreateArticleView", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				});
			}
		}
	}

	if (adminProjectsButtons[0]) {
		if (!adminProjectsButtons[0].classList.value.includes("selected-button")) {
			for (let i = 0; i < adminProjectsButtons.length; i++) {
				const button = adminProjectsButtons[i];

				button.addEventListener("click", async function (event) {
					try {
						const response = await fetch("/loadAdminProjectView", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				});
			}
		}
	}

	if (createProjectsButtons[0]) {
		if (!createProjectsButtons[0].classList.value.includes("selected-button")) {
			for (let i = 0; i < createProjectsButtons.length; i++) {
				const button = createProjectsButtons[i];

				button.addEventListener("click", async function (event) {
					// Redirect the user to the create article form.
					try {
						const response = await fetch("/loadCreateProjectView", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				});
			}
		}
	}

	if (menuButton) {
		menuButton.addEventListener("mouseover", async function (event) {
			if (event.target != this) {
				return;
			}

			menuButton.style.transform = "scale(1.1, 1.1)";
		});

		menuButton.addEventListener("mousedown", async function (event) {
			if (event.target != this) {
				return;
			}

			menuButton.style.transform = "scale(0.9, 0.9)";
		});

		menuButton.addEventListener("mouseup", async function (event) {
			if (event.target != this) {
				return;
			}

			menuButton.style.transform = "scale(1, 1)";
		});

		menuButton.addEventListener("mouseout", async function (event) {
			if (event.target != this) {
				return;
			}

			menuButton.style.transform = "scale(1, 1)";
		});

		var duration = 80;
		menuButton.addEventListener("click", async function (event) {
			if (event.target != this) {
				return;
			}

			menuButton.style.transform = "scale(1, 1)";

			if (selectedButtons[0]) {
				selectedButtons[1].style.backgroundColor = "transparent";
			}

			if (floatingMenu.children.length > 2) {
				floatingMenu.style.animation = "show-menu 0.5s ease-in-out forwards";
			} else {
				floatingMenu.style.animation = "show-menu-admin 0.5s ease-in-out forwards";
			}

			setTimeout(() => {
				for (let i = 0; i < floatingMenu.children.length; i++) {
					const button = floatingMenu.children[i];

					setTimeout(() => {
						if (button.classList.contains("selected-button")) {
							button.style.backgroundColor = "rgba(188, 161, 112, 0.584)";
						}

						button.style.animation = "show-menu-button " + 0.2 + "s ease-in forwards";
					}, duration);

					duration += 80;
				}
			}, 200);

			duration = 30;

			setTimeout(() => {
				for (let i = floatingMenu.children.length - 1; i >= 0; i--) {
					const button = floatingMenu.children[i];

					setTimeout(() => {
						if (button.classList.contains("selected-button")) {
							button.style.backgroundColor = "transparent";
						}

						button.style.animation = "hide-menu-button " + 0.2 + "s ease-in forwards";
					}, duration);

					duration += 30;
				}

				setTimeout(() => {
					if (floatingMenu.children.length > 2) {
						floatingMenu.style.animation = "hide-menu 0.5s ease-in-out forwards";
					} else {
						floatingMenu.style.animation = "hide-menu-admin 0.5s ease-in-out forwards";
					}
				}, 500);
			}, 5000);
		});
	}

	if (emailButton) {
		emailButton.addEventListener("click", async function (event) {
			try {
				const response = await fetch("/loadContacts", { method: "post" });
				if (!response.ok) throw new Error("Network response was not ok");

				const result = await response.json();

				window.location.href = result.redirectUrl;
			} catch (error) {
				console.error("Error fetching articles:", error);
			}
		});
	}

	if (facebookButton) {
		facebookButton.addEventListener("click", async function (event) {
			window.location.href = "https://www.facebook.com";
		});
	}

	if (instagramButton) {
		instagramButton.addEventListener("click", async function (event) {
			window.location.href = "https://www.instagram.com";
		});
	}
});
