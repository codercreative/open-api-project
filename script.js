"use strict";

//function...
fetch("https://api.artic.edu/api/v1/artworks")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });
