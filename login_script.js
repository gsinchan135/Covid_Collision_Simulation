const thePassword = document.getElementById("password");  //form input password
const validationMsg = document.getElementById("passwordMsg"); //div containing message indicating what is missing from an acceptable password
const number = document.getElementById("aNumber"); //p alerting user if they have a number in password
const length = document.getElementById("charLength");//p alerting user if they have 8 characters or more


thePassword.onfocus = function(){
    validationMsg.style.display = "block";  //when the user goes to input password, they are notified of the necessary requirements via a message right below
}
thePassword.onblur = function(){
    if(password.value.length == 0)
        validationMsg.style.display = "none"; //if they decide to click off password before typing anything, the requirements will go away
}                                             //otherwise the user should be notified at all times if they are meeting the requirements

thePassword.addEventListener("keyup",Validation)

function Validation(){
 const numbers = /[0-9]/g;
    
  //Validates that the password contain at least 8 characters
  if(password.value.length >= 8) {
    length.classList.remove("invalid");//invalid turns text red and adds x before text
    length.classList.add("valid"); //valid turns text green and adds checkmark before text
  } 
  else {
    length.classList.remove("valid");
    length.classList.add("invalid");
  }

 //Validates that the password contains a number
  if(password.value.match(numbers)) {  
    number.classList.remove("invalid");
    number.classList.add("valid");
  } 
  else {
    number.classList.remove("valid");
    number.classList.add("invalid");
  }

}
