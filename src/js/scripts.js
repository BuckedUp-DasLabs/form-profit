const form = document.querySelector("#custom-form");
const allInputs = form.querySelectorAll("input");

const createInvalid = (text) => {
  return `<p class="error-text">${text}</p>`;
};

const checkInput = (input) => {
  const regex = input.getAttribute("regex");
  const reg = new RegExp(`${regex}`);
  const match = document.getElementById(input.getAttribute("match"));
  const matcher = document.querySelector(`[match="${input.id}"]`);

  const valueIsNotValid = () => {
    return (
      (regex && !reg.test(input.value)) ||
      (match && input.value !== match.value) ||
      (matcher && input.value !== matcher.value && matcher.value.length !== 0)
    );
  };

  if (input.type === "checkbox" && !input.checked) return false;
  if (
    (!input.hasAttribute("optional") && input.value.trim().length === 0) ||
    valueIsNotValid()
  ) {
    input.classList.add("error");
    if (
      valueIsNotValid() &&
      input.value.trim().length > 0 &&
      !input.nextElementSibling?.classList.contains("error-text")
    ) {
      input.insertAdjacentHTML("afterend", createInvalid("Invalid!"));
    }
    return false;
  }
  input.classList.remove("error");
  matcher?.classList.remove("error");
  match?.classList.remove("error");
  if (input.nextElementSibling?.classList.contains("error-text"))
    input.nextElementSibling.remove();
  if (matcher?.nextElementSibling?.classList.contains("error-text"))
    matcher?.nextElementSibling.remove();
  if (match?.nextElementSibling?.classList.contains("error-text"))
    match?.nextElementSibling.remove();
  return true;
};

const addListener = (input) => {
  const listeners = ["focusout"];
  if (input.type === "checkbox") listeners.push("input");
  listeners.forEach((ev) => {
    input.addEventListener(ev, () => {
      checkInput(input);
    });
  });
};

allInputs.forEach((input) => {
  addListener(input);
});

const countrySelect = document.querySelector("#country");
const stateSelect = document.querySelector("#state");

const updateStates = async () => {
  stateSelect.toggleAttribute("disabled");
  const body = {};
  body.country = "United States";
  const response = await fetch(
    `https://countriesnow.space/api/v0.1/countries/states`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const responseJson = await response.json();
  if (!response.ok) {
    alert("There was a problem fetching the states of the selected country.");
    console.log(responseJson);
    return;
  }
  stateSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.innerHTML = "Please Select";
  stateSelect.appendChild(placeholder);
  responseJson.data.states.forEach((state) => {
    let option = document.createElement("option");
    option.value = state.state_code;
    option.innerHTML = state.name;
    stateSelect.appendChild(option);
  });
  updateSelect(stateSelect);
  stateSelect.toggleAttribute("disabled");
};

updateStates();

const validateForm = () => {
  const inputs = form.querySelectorAll("input");
  const selects = form.querySelectorAll("select");
  let isValid = true;
  inputs.forEach((input) => {
    if (!checkInput(input)) {
      isValid = false;
      input.classList.add("error");
    }
  });
  selects.forEach((select) => {
    if (select.value === "") {
      isValid = false;
      select.classList.add("error");
      select.addEventListener("change", () => {
        if (select.value !== "") {
          select.classList.remove("error");
          document
            .querySelector(`[original-id="${select.id}"]`)
            .classList.remove("error");
        }
      });
    }
  });
  if (isValid) return true;
  return false;
};

const getValues = () => {
  const formFields = {};
  formFields.first_name = document.querySelector("#first-name").value;
  formFields.last_name = document.querySelector("#last-name").value;
  formFields.email = document.querySelector("#email").value;
  formFields.phone = document.querySelector("#phone").value;
  formFields.address = {}
  formFields.address.city = document.querySelector("#city").value;
  formFields.address.country_code = "US"
  formFields.address.state = document.querySelector("#state").value;
  return formFields;
};

const apiErrorField = document.querySelector(".api-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = document.querySelector('button[type = "submit"]');
  const spinner = document.querySelector(".lds-dual-ring");
  button.toggleAttribute("disabled");
  spinner.classList.toggle("active");
  if (!validateForm()) {
    alert("Required field missing or invalid.");
    button.toggleAttribute("disabled");
    spinner.classList.toggle("active");
    return;
  }
  const body = getValues();
  body["customer_group"] = "wholesale_pending"
  console.log(body)
  return
  const response = await fetch(
    "",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    const responseLog = await response.json();
    apiErrorField.classList.toggle("active");
    if (responseLog.error_code === "AlreadyAffiliate")
      responseLog.error_message = "The customer account is already associated with a ambassador application"
    apiErrorField.innerHTML = responseLog.error_message;
    button.toggleAttribute("disabled");
    spinner.classList.toggle("active");
    return;
  }
  window.location.href = redirectUrls[document.getElementById("industry").value]
});
