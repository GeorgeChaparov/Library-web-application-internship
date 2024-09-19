const monthNames = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];

var projectsArray = [];

document.addEventListener("DOMContentLoaded", async function () {
	const articlesListDiv = document.getElementById("articles");

	try {
		const response = await fetch("/getArticles");
		if (!response.ok) throw new Error("Network response was not ok");

		const articles = await response.json();

		articles.reverse();
		articles.forEach((article) => {
			const articleWrapperDiv = document.createElement("div");
			articleWrapperDiv.classList.add("article-wrapper");
			articleWrapperDiv.id = article.id;

			const articleWindowDiv = document.createElement("div");
			articleWindowDiv.classList.add("article-window");

			var image_path;

			var count = 0;
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
			articleImageDiv.style.backgroundImage = `url("${image_path}")`;

			if (isAdminView) {
				const idDiv = document.createElement("div");
				idDiv.classList.add("article-id");
				idDiv.innerHTML = article.id;

				articleImageDiv.appendChild(idDiv);
			}

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
			articleWrapperDiv.appendChild(articleWindowDiv);

			articlesListDiv.appendChild(articleWrapperDiv);

			articleWrapperDiv.addEventListener("click", async function () {
				sessionStorage.setItem("id", this.id);

				if (isAdminView) {
					// Redirect the user to the edit article form.
					try {
						const response = await fetch("/loadEditArticleView", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				} else {
					try {
						const response = await fetch("/loadViewArticle", { method: "post" });
						if (!response.ok) throw new Error("Network response was not ok");

						const result = await response.json();

						window.location.href = result.redirectUrl;
					} catch (error) {
						console.error("Error fetching articles:", error);
					}
				}
			});

			projectsArray.push(articleWrapperDiv);
		});
	} catch (error) {
		console.error("Error fetching articles:", error);
	}
});
