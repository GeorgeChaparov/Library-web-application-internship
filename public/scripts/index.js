document.addEventListener("DOMContentLoaded", async function () {
	let currentImageIndex = 1;

	let isMouseOnBanner = false;

	const images = ["793739842.jpg", "536027014.jpg", "600457676.jpg"];
	const bannerImage = document.getElementById("banner-image");
	const bannerList = document.getElementById("banner-list");
	const articlesList = document.getElementById("articles");
	const moreButton = document.getElementById("more-button");
	bannerImage.style.backgroundImage = "url(./banner/images/" + images[0] + ")";
	try {
		const response = await fetch("/getLastNineArticles");
		if (!response.ok) throw new Error("Network response was not ok");

		const articles = await response.json();

		articles.forEach((article) => {
			const articleWrapperDiv = document.createElement("div");
			articleWrapperDiv.classList.add("article-wrapper");

			const articleWindowDiv = document.createElement("div");
			articleWindowDiv.classList.add("article-window");
			articleWindowDiv.id = article.id;

			let image_path;

			let count = 0;
			for (let i = 0; i < article.image_path.length; i++) {
				const char = article.image_path.charAt(i);

				if (count === 3) {
					image_path = article.image_path.slice(0, i - 3);
					break;
				}

				if (char === "|") {
					++count;
				} else {
					count = 0;
					continue;
				}
			}

			const articleImageDiv = document.createElement("div");
			articleImageDiv.classList.add("article-image");
			articleImageDiv.style.backgroundImage = `url(${image_path})`;

			const articleTitleAndDescriptionWrapper = document.createElement("div");
			articleTitleAndDescriptionWrapper.classList.add("article-title-and-description-wrapper");

			const articleTitle = document.createElement("div");
			articleTitle.classList.add("article-title");
			articleTitle.classList.add("montserrat-for-titles");
			articleTitle.innerHTML = article.title;

			const articleDescription = document.createElement("div");
			articleDescription.classList.add("article-description");
			articleDescription.classList.add("wix-madefor-display-for-long-text");
			articleDescription.innerHTML = article.description;

			const articleDate = document.createElement("div");
			articleDate.classList.add("article-date");
			articleDate.innerHTML = article.upload_date;

			articleTitleAndDescriptionWrapper.appendChild(articleTitle);
			articleTitleAndDescriptionWrapper.appendChild(articleDescription);

			articleWindowDiv.appendChild(articleImageDiv);
			articleWindowDiv.appendChild(articleTitleAndDescriptionWrapper);
			articleWindowDiv.appendChild(articleDate);

			articleWindowDiv.addEventListener("click", async function () {
				sessionStorage.setItem("id", this.id);

				try {
					const response = await fetch("/loadViewArticle", { method: "post" });
					if (!response.ok) throw new Error("Network response was not ok");

					const result = await response.json();

					window.location.href = result.redirectUrl;
				} catch (error) {
					console.error("Error fetching articles:", error);
				}
			});

			articleWrapperDiv.appendChild(articleWindowDiv);
			articlesList.appendChild(articleWrapperDiv);
		});
	} catch (error) {
		console.error("Error fetching articles:", error);
	}

	const changeBannerImage = function () {
		updateBannerAndList();
	};

	const changeBannerImageByClick = function () {
		currentImageIndex = this.innerHTML;

		updateBannerAndList();

		clearInterval(bannerIntervalId);
		bannerIntervalId = setInterval(changeBannerImage, 3000);
	};

	let bannerIntervalId = setInterval(changeBannerImage, 3000);

	for (let i = 0; i < images.length; i++) {
		const image = images[i];

		const li = document.createElement("li");
		li.innerHTML = i;
		li.style.fontSize = "0px";
		li.style.userSelect = "none";
		li.style.transition = "all 1s ease-in";
		li.style.cursor = "pointer";
		if (i == 0) {
			li.style.backgroundColor = "white";
			li.style.transform = "scale(0.8, 0.8)";
		} else {
			li.addEventListener("click", changeBannerImageByClick);
		}

		bannerList.appendChild(li);
	}

	async function updateBannerAndList() {
		bannerImage.classList.remove("show-banner");
		void bannerImage.offsetWidth;
		bannerImage.classList.add("show-banner");

		for (let i = 0; i < bannerList.children.length; i++) {
			const element = bannerList.children[i];

			element.removeEventListener("click", changeBannerImageByClick);
		}

		setTimeout(() => {
			bannerImage.style.backgroundImage = "url(./banner/images/" + images[currentImageIndex] + ")";
		}, 500);

		setTimeout(() => {
			for (let i = 0; i < bannerList.children.length; i++) {
				const element = bannerList.children[i];

				if (currentImageIndex - 1 == -1) {
					if (bannerList.children.length - 1 == i) {
						continue;
					}
				} else {
					if (currentImageIndex - 1 == i) {
						continue;
					}
				}

				element.addEventListener("click", changeBannerImageByClick);
			}
		}, 1000);

		for (let i = 0; i < bannerList.children.length; i++) {
			const element = bannerList.children[i];
			if (currentImageIndex == i) {
				element.style.backgroundColor = "white";
				element.style.transform = "scale(0.8, 0.8)";
				continue;
			}

			element.style.backgroundColor = "black";
			element.style.transform = "scale(1, 1)";
		}

		++currentImageIndex;

		if (currentImageIndex == images.length) {
			currentImageIndex = 0;
		}
	}

	bannerImage.addEventListener("mouseover", function (event) {
		if (this != event.target || isMouseOnBanner) {
			return;
		}
		clearInterval(bannerIntervalId);
		isMouseOnBanner = true;
	});

	bannerImage.addEventListener("mouseleave", function (event) {
		if (!isMouseOnBanner) {
			return;
		}

		bannerIntervalId = setInterval(changeBannerImage, 3000);
		isMouseOnBanner = false;
	});

	moreButton.addEventListener("click", async function (event) {
		try {
			const response = await fetch("/loadArticlesView", { method: "post" });
			if (!response.ok) throw new Error("Network response was not ok");

			const result = await response.json();

			window.location.href = result.redirectUrl;
		} catch (error) {
			console.error("Error fetching articles:", error);
		}
	});
});
