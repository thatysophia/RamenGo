document.addEventListener("DOMContentLoaded", function () {
  fetchBroths();
  fetchProteins();

  document
    .getElementById("placeOrderButton")
    .addEventListener("click", submitOrder);
});

function fetchBroths() {
  fetch("https://api.tech.redventures.com.br/broths", {
    headers: {
      "x-api-key": "ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf",
    },
  })
    .then((response) => response.json())
    .then((data) => populateGallery(data, "brothGallery", "broth"))
    .catch((error) => console.error("Error fetching broths:", error));
}

function fetchProteins() {
  fetch("https://api.tech.redventures.com.br/proteins", {
    headers: {
      "x-api-key": "ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf",
    },
  })
    .then((response) => response.json())
    .then((data) => populateGallery(data, "proteinImages", "protein"))
    .catch((error) => console.error("Error fetching proteins:", error));
}

function populateGallery(items, galleryId, type) {
  const gallery = document.getElementById(galleryId);
  gallery.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = `${type}-card`;
    card.dataset.id = item.id;
    card.dataset.name = item.name;
    card.dataset.price = item.price;

    card.innerHTML = `
      <img src="${item.imageActive}" alt="Image of ${item.name}" class="${type}-image">
      <h4>${item.name}</h4>
      <p class="${type}-description">${item.description}</p>
      <p class="${type}-price">US$${item.price}</p>
    `;

    card.addEventListener("click", () => selectItem(card, gallery, type));
    gallery.appendChild(card);
  });
}

function selectItem(card, gallery, type) {
  const previouslySelected = gallery.querySelector(".selected");
  if (previouslySelected) {
    previouslySelected.classList.remove("selected");
  }
  card.classList.add("selected");

  sessionStorage.setItem(
    `selected${type.charAt(0).toUpperCase() + type.slice(1)}`,
    JSON.stringify({
      id: card.dataset.id,
      name: card.dataset.name,
      price: card.dataset.price,
    })
  );
  console.log(`Selected ${type}:`, card.dataset.id);
}

function submitOrder() {
  const selectedBroth = JSON.parse(sessionStorage.getItem("selectedBroth"));
  const selectedProtein = JSON.parse(sessionStorage.getItem("selectedProtein"));

  if (!selectedBroth || !selectedProtein) {
    alert("Please select both broth and protein to place your order.");
    return;
  }

  fetch("https://api.tech.redventures.com.br/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf",
    },
    body: JSON.stringify({
      brothId: selectedBroth.id,
      proteinId: selectedProtein.id,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Order successfully submitted:", data);
      localStorage.setItem(
        "orderDetails",
        JSON.stringify({
          orderId: data.id,
          broth: selectedBroth,
          protein: selectedProtein,
          totalPrice:
            parseFloat(selectedBroth.price) + parseFloat(selectedProtein.price),
        })
      );
      window.location.href = "order-summary.html";
    })
    .catch((error) => console.error("Error submitting order:", error));
}
