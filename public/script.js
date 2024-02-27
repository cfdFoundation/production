//Redirect proxies for oDoo
const payload = { entryURL: window.location.hostname };
fetch("/routers/framework/redirectURL", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
})
  .then((response) => response.json())
  .then((data) => {
  console.log(data);
    if (data.length > 0){
      data.forEach((rURL) => {
          //If we have a destinationURL, redirect to it
          if (rURL.destinationurl != ""){
            window.location.replace(rURL.destinationurl);
          } else {
            adviserTest();
          }
        });
    } else {
      adviserTest();
    }
  });

function adviserTest(){
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
    }); 
}
  
  // v1.0.5
