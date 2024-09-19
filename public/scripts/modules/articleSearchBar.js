const TypeOfInput = {
	None: 0,
	OnlyDigits: 1,
	All: 2,
	OnlyDigitsAndDashes: 4,
};

const EventType = {
	None: 0,
	OnMouseOver: 1,
	OnMouseDown: 2,
	OnMouseOutNoClick: 4,
	OnMouseUpAfterClick: 5,
};

const SearchOption = {
	None: 0,
	ASC: 1,
	DESC: 2,
};

const DateType = {
	None: 0,
	Day: 1,
	Month: 2,
	Year: 3,
	DayAndMonth: 4,
	DayAndYear: 5,
	MonthAndYear: 6,
	DayMonthAndYear: 7,
};

document.addEventListener("DOMContentLoaded", async function () {
	const articlesListDiv = document.getElementById("articles");
	const searchBar = document.getElementById("search-bar");
	const searchByAscButton = document.getElementById("search-order-by-asc-button");
	const searchByDescButton = document.getElementById("search-order-by-desc-button");

	const tooltip = document.getElementById("tooltip");

	var tempArrayMatch = [];

	var isSearchingByAscActive = false;
	var hasClicked = false;

	var typeOfInput = TypeOfInput.All;
	var searchOption = SearchOption.None;
	var shouldHighlight = true;
	var dateType = DateType.None;

	searchByAscButton.addEventListener("click", function () {
		hasClicked = true;

		updateOptionButtons(this, EventType.OnMouseUpAfterClick);

		if (!isSearchingByAscActive) {
			isSearchingByAscActive = true;
			updateArticlesOnOrderChanged();
		}
	});

	searchByDescButton.addEventListener("click", function () {
		hasClicked = true;

		updateOptionButtons(this, EventType.OnMouseUpAfterClick);

		if (isSearchingByAscActive) {
			isSearchingByAscActive = false;
			updateArticlesOnOrderChanged();
		}
	});

	searchByAscButton.addEventListener("mousedown", function () {
		updateOptionButtons(this, EventType.OnMouseDown);
	});

	searchByDescButton.addEventListener("mousedown", function () {
		updateOptionButtons(this, EventType.OnMouseDown);
	});

	searchByAscButton.addEventListener("mouseover", function () {
		updateOptionButtons(this, EventType.OnMouseOver);
	});

	searchByDescButton.addEventListener("mouseover", function () {
		updateOptionButtons(this, EventType.OnMouseOver);
	});

	searchByAscButton.addEventListener("mouseout", function () {
		if (hasClicked) {
			hasClicked = false;
			return;
		}
		updateOptionButtons(this, EventType.OnMouseOutNoClick);
	});

	searchByDescButton.addEventListener("mouseout", function () {
		if (hasClicked) {
			hasClicked = false;
			return;
		}
		updateOptionButtons(this, EventType.OnMouseOutNoClick);
	});

	searchBar.addEventListener("input", function () {
		tempArrayMatch.splice(0, tempArrayMatch.length);

		var trimedSearchValue = searchBar.value.trim();

		typeOfInput = TypeOfInput.All;
		searchOption = SearchOption.None;
		dateType = DateType.None;
		shouldHighlight = true;

		if (trimedSearchValue == "") {
			updateArticlesOnOrderChanged();
			return;
		}

		// Checks if the value contains only digits by using regular expression.
		if (/^\d+$/.test(trimedSearchValue)) {
			typeOfInput = TypeOfInput.OnlyDigits;
			shouldHighlight = false;
		}
		// Checks if the value contains only digits and dashes in date like order by using regular expression.
		else {
			if (/^\d{2}-$/.test(trimedSearchValue)) {
				dateType = DateType.Day;
			} else if (/^-\d{2}-$/.test(trimedSearchValue)) {
				dateType = DateType.Month;
			} else if (/^-\d{4}$/.test(trimedSearchValue)) {
				dateType = DateType.Year;
			} else if (/^d{2}--\d{2}-$/.test(trimedSearchValue)) {
				dateType = DateType.DayAndMonth;
			} else if (/^-\d{2}--\d{4}$/.test(trimedSearchValue)) {
				dateType = DateType.MonthAndYear;
			} else if (/^\d{2}--\d{4}$/.test(trimedSearchValue)) {
				dateType = DateType.DayAndYear;
			} else if (/^\d{2}-\d{2}-\d{4}$/.test(trimedSearchValue)) {
				dateType = DateType.DayMonthAndYear;
			}

			if (dateType != DateType.None) {
				typeOfInput = TypeOfInput.OnlyDigitsAndDashes;
				shouldHighlight = false;
			}
		}

		if (isSearchingByAscActive) {
			searchOption = SearchOption.ASC;
		} else {
			searchOption = SearchOption.DESC;
		}

		Search(searchOption, typeOfInput, dateType, shouldHighlight);
	});

	searchBar.addEventListener("mousemove", function (event) {
		const mouseX = event.clientX;
		const mouseY = event.clientY;

		tooltip.style.left = 15 + mouseX + "px";
		tooltip.style.top = 10 + mouseY + "px";
	});

	function updateArticlesOnOrderChanged() {
		articlesListDiv.innerHTML = "";

		if (tempArrayMatch[0]) {
			switch (typeOfInput) {
				case TypeOfInput.All:
					tempArrayMatch.sort(function (a, b) {
						const titleA = a.children[0].children[1].children[0].innerHTML.toLowerCase();
						const titleB = b.children[0].children[1].children[0].innerHTML.toLowerCase();

						return titleA.localeCompare(titleB);
					});

					break;

				case TypeOfInput.OnlyDigits:
					tempArrayMatch.sort(function (a, b) {
						return a.id - b.id;
					});
					break;

				case TypeOfInput.OnlyDigitsAndDashes:
					tempArrayMatch.sort(function (a, b) {
						return a.id - b.id;
					});
					break;

				default:
					break;
			}

			if (!isSearchingByAscActive) {
				tempArrayMatch.reverse();
			}

			for (let i = 0; i < tempArrayMatch.length; i++) {
				const article = tempArrayMatch[i];

				articlesListDiv.appendChild(article);
			}
		} else if (searchBar.value == "") {
			projectsArray.sort(function (a, b) {
				return a.id - b.id;
			});

			if (!isSearchingByAscActive) {
				projectsArray.reverse();
			}

			for (let i = 0; i < projectsArray.length; i++) {
				const article = projectsArray[i];

				var articleTitle = article.children[0].children[1].children[0];
				articleTitle.innerHTML = articleTitle.innerHTML.replaceAll("<span>", "");
				articleTitle.innerHTML = articleTitle.innerHTML.replaceAll('<span class="highlight-sub-string">', "");
				articleTitle.innerHTML = articleTitle.innerHTML.replaceAll("</span>", "");

				articlesListDiv.appendChild(article);
			}
		} else {
			var lable = document.createElement("label");

			lable.innerHTML = "No article found containing " + searchBar.value.trim() + ".";
			articlesListDiv.appendChild(lable);
		}
	}

	function highlightSubStringInString(subString, string) {
		string = string.replaceAll("<span>", "");
		string = string.replaceAll('<span class="highlight-sub-string">', "");
		string = string.replaceAll("</span>", "");

		var subStringLength = subString.length;

		var newString = "<span>";

		while (string != "") {
			var currentSubStringStartPos = string.indexOf(subString);

			if (currentSubStringStartPos == -1) {
				newString += string + "</span>";
				break;
			}

			newString += string.slice(0, currentSubStringStartPos);

			var span = "<span class='highlight-sub-string'>" + subString + "</span>";

			newString += span;

			var endPosOfLastSubString = currentSubStringStartPos + subStringLength;

			string = string.slice(endPosOfLastSubString);
		}

		return newString;
	}

	/**
	 * Performs a search based on the specified search options.
	 * @param {SearchOption} searchOption - The search option to apply.
	 * @param {TypeOfInput} typeOfInput - The search option to apply.
	 */
	function Search(searchOption, typeOfInput, dateType, shouldHighlight = true) {
		var stringToTest = searchBar.value.trim();

		articlesListDiv.innerHTML = "";

		for (let i = 0; i < projectsArray.length; i++) {
			const article = projectsArray[i];
			var stringToSearchIn;

			switch (typeOfInput) {
				case TypeOfInput.All:
					const titleElement = article.children[0].children[1].children[0];
					stringToSearchIn = titleElement.textContent;
					break;

				case TypeOfInput.OnlyDigits:
					stringToSearchIn = article.id;
					break;

				case TypeOfInput.OnlyDigitsAndDashes:
					const dateElement = article.children[0].children[2];

					let comma = dateElement.textContent.indexOf(",");

					let dateYear = dateElement.textContent.slice(comma + 2);
					let dateMonth = dateElement.textContent.slice(3, comma);
					let dateDay = dateElement.textContent.slice(0, 2);

					let month = monthNames.findIndex((month) => month.toLowerCase() === dateMonth.toLowerCase());

					if (month > 9) {
						month = `${month + 1}`;
					} else {
						month = `0${month + 1}`;
					}

					let transformedDate = "";

					switch (dateType) {
						case DateType.Day:
							transformedDate = `${dateDay}-`;
							break;

						case DateType.Month:
							transformedDate = `-${month}-`;
							break;

						case DateType.Year:
							transformedDate = `-${dateYear}`;
							break;

						case DateType.DayAndMonth:
							transformedDate = `${dateDay}--${month}-`;
							break;

						case DateType.DayAndYear:
							transformedDate = `${dateDay}--${dateYear}`;
							break;

						case DateType.MonthAndYear:
							transformedDate = `-${month}--${dateYear}`;
							break;

						case DateType.DayMonthAndYear:
							transformedDate = `${dateDay}-${month}-${dateYear}`;
							break;
						default:
							break;
					}

					stringToSearchIn = transformedDate;

					break;

				default:
					break;
			}

			if (stringToSearchIn.includes(stringToTest)) {
				tempArrayMatch.push(article);
			}
		}

		if (tempArrayMatch[0]) {
			switch (typeOfInput) {
				case TypeOfInput.All:
					tempArrayMatch.sort(function (a, b) {
						const titleA = a.children[0].children[1].children[0].innerHTML.toLowerCase();
						const titleB = b.children[0].children[1].children[0].innerHTML.toLowerCase();

						return titleA.localeCompare(titleB);
					});

					break;

				case TypeOfInput.OnlyDigits:
					tempArrayMatch.sort(function (a, b) {
						return a.id - b.id;
					});
					break;

				case TypeOfInput.OnlyDigitsAndDashes:
					tempArrayMatch.sort(function (a, b) {
						return a.id - b.id;
					});
					break;

				default:
					break;
			}

			if (searchOption === SearchOption.DESC) {
				tempArrayMatch.reverse();
			}

			for (let i = 0; i < tempArrayMatch.length; i++) {
				const article = tempArrayMatch[i];
				var elementToHighlight;

				switch (typeOfInput) {
					case TypeOfInput.All:
						const titleElement = article.children[0].children[1].children[0];
						elementToHighlight = titleElement;
						break;

					default:
						break;
				}

				if (shouldHighlight) {
					elementToHighlight.innerHTML = highlightSubStringInString(stringToTest, elementToHighlight.innerHTML);
				}

				articlesListDiv.appendChild(article);
			}
		} else {
			var lable = document.createElement("label");

			lable.innerHTML = "No article found containing " + stringToTest + ".";
			articlesListDiv.appendChild(lable);
		}
	}

	/**
	 * @param {HTMLElement} button
	 * @param {EventType} eventType
	 */
	function updateOptionButtons(button, eventType) {
		if (button == searchByAscButton) {
			if (!isSearchingByAscActive) {
				updateButton(searchByAscButton, false, eventType);
				updateButton(searchByDescButton, true, eventType);
			}
		} else {
			if (isSearchingByAscActive) {
				updateButton(searchByAscButton, true, eventType);
				updateButton(searchByDescButton, false, eventType);
			}
		}
	}

	/**
	 * @param {HTMLElement} button
	 * @param {boolean} isActive
	 * @param {EventType} eventType
	 */
	function updateButton(button, isActive, eventType) {
		const buttonStyle = button.style;

		if (isActive) {
			switch (eventType) {
				case EventType.OnMouseOver:
					buttonStyle.backgroundColor = "rgb(220, 189, 148)";
					buttonStyle.transform = "scale(0.9, 0.9)";
					break;
				case EventType.OnMouseDown:
					buttonStyle.backgroundColor = "rgb(220, 189, 148)";
					buttonStyle.transform = "scale(0.9, 0.9)";
					break;
				case EventType.OnMouseOutNoClick:
					buttonStyle.backgroundColor = "rgb(247, 202, 144)";
					buttonStyle.transform = "scale(1.1, 1.1)";
					break;
				case EventType.OnMouseUpAfterClick:
					buttonStyle.backgroundColor = "white";
					buttonStyle.transform = "scale(1, 1)";
					break;
				default:
					break;
			}
		} else {
			switch (eventType) {
				case EventType.OnMouseOver:
					buttonStyle.backgroundColor = "rgb(247, 202, 144)";
					buttonStyle.transform = "scale(1.1, 1.1)";
					break;
				case EventType.OnMouseDown:
					buttonStyle.backgroundColor = "rgb(240, 196, 138)";
					buttonStyle.transform = "scale(1, 1)";
					break;
				case EventType.OnMouseOutNoClick:
					buttonStyle.backgroundColor = "white";
					buttonStyle.transform = "scale(1, 1)";
					break;
				case EventType.OnMouseUpAfterClick:
					buttonStyle.backgroundColor = "rgb(240, 196, 138)";
					buttonStyle.transform = "scale(1.1, 1.1)";
					break;
				default:
					break;
			}
		}
	}
});
