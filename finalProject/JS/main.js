/*
Name: Alexander Balandin
ID: 132145194
DATA: 10/29/2020
Heroku url: https://glacial-eyrie-05995.herokuapp.com/
*/ 
window.onload = () => {
  //burger button animation
  navSlide();
  //end burger button animation
};
//burger animation
const navSlide = () => {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links li");

  burger.addEventListener("click", () => {
    //toggle nav
    nav.classList.toggle("nav-active");
    //Animate links
    navLinks.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = " ";
      } else {
        link.style.animation = `navLinkFade 0.5s ease forwards ${
          index / 5 + 1
        }s`;
      }
    });
    //the burger button animation(the divs)
    burger.classList.toggle("toggle");
  });
};
//end burger animation
