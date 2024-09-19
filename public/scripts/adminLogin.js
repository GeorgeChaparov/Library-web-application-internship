document.addEventListener("DOMContentLoaded", async function () {
	const submitButton = document.getElementById("submit-button");
	const errorMessage = document.getElementById("error-message");
	const userName = document.getElementById("user-name");
	const password = document.getElementById("password");

	submitButton.addEventListener("click", async function (event) {
		if (!userName.value || !password.value) {
			errorMessage.innerHTML = "Username and password are required.";
			return;
		} else {
			try {
				const response = await fetch("/checkAdminAccount", {
					method: "post",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ userName: userName.value, password: password.value }),
				});
				if (!response.ok) throw new Error("Network response was not ok");

				const result = await response.json();

				if (result.message == "Login unsuccessful. Invalid username or password.") {
					errorMessage.innerHTML = result.message;
				} else {
					window.location.href = result.redirectUrl;
				}
			} catch (error) {
				console.error("Error logging: ", error);
			}
		}
	});
});
