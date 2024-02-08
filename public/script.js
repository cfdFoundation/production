//Redirect proxies for oDoo
if (window.location.hostname == "herdspace.com"){
  window.location.replace("https://www.herdspace.com");
}
if (window.location.hostname == "joincfd.com"){
  window.location.replace("https://www.joincfd.com");
}


fetch("/routers/api/getAdvisorList")
  .then((response) => response.json())
  .then((data) => {
	data.forEach((advisor) => {
      // Select the <template> we created in index.html
      const cardTemplate = document.querySelector("template");

      // Clone a copy of the template we can insert in the DOM as a real visible node
      const card = cardTemplate.content.cloneNode(true);

      // Update the content of the cloned template with the employee data we queried from the backend
      card.querySelector("name").innerText = advisor.first_name + ' ' + advisor.last_name;
      card.querySelector("company").innerText = advisor.company_name; 
      card.querySelector("email").innerText = advisor.company_email.toLowerCase();

      // Append the card as a child with the employee data to the <body> element on our page
      document.body.appendChild(card);
    });
  }); // v1.0.4
