document.addEventListener("DOMContentLoaded", async function () {
	const submitButton = document.getElementById("submit-button");
	const responseMessage = document.getElementById("response-message");

	const senderName = document.getElementById("name");
	const senderEmail = document.getElementById("senderEmail");
	const senderTitle = document.getElementById("title");
	const senderMessage = document.getElementById("message");
	var isFirstSend = true;

	submitButton.addEventListener("click", async function (event) {
		if (!senderName.value || !senderEmail.value || !senderTitle.value || !senderMessage.value) {
			responseMessage.innerHTML = "Please fill in all fields.";

			responseMessage.style.color = "red";
			return;
		}

		if (isFirstSend) {
			try {
				const response = await fetch("/sendEmail", {
					method: "post",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ senderName: senderName.value, senderEmail: senderEmail.value, senderTitle: senderTitle.value, senderMessage: senderMessage.value }),
				});
				if (!response.ok) throw new Error("Network response was not ok");

				const result = await response.json();

				responseMessage.innerHTML = result.message;

				responseMessage.style.color = "black";
			} catch (error) {
				console.error("Error fetching articles:", error);
			}

			isFirstSend = false;
		} else {
			responseMessage.innerHTML = "You cant send more then one message at a time.";
			responseMessage.style.color = "red";
		}
	});
});
