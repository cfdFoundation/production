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
          }
        });
    } else {
    }
  });


  
  // v1.0.8 
  // nuke wire harness stuff for security
