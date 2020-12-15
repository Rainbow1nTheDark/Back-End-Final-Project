/*
Name: Alexander Balandin
ID: 132145194
DATA: 10/29/2020
Heroku url: https://glacial-eyrie-05995.herokuapp.com/
*/ 
module.exports.getErrors = (reqData) =>{
    let errors = {isValid: true, email: '',  userName:'', lastName:'', firstName: '', password: ''}
    validatePsw(errors, reqData)
    validateUserName(errors, reqData)
    validateEmail(errors, reqData)
    validateLastName(errors, reqData)
    validateFirstName(errors, reqData)
    return errors;
}
module.exports.getLoginErrors = (reqData) =>{
    let errors = {isValid: true, isLogin: true, email:'', password:''}
    validateEmail(errors, reqData)
    checkPsw(errors, reqData)
    return errors;
}

const checkPsw = (errors, reqData) =>{
    if(!reqData.psw)
    {
        errors.password = 'Password is required'
        errors.isValid = false
    }
}
const validatePsw = (errors, reqData) =>{
    const pswRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,12}$/;
    const isPsw = reqData.psw.match(pswRegex)
    if(!isPsw)
    {
        errors.password = 'Password must contain at least one number, one lowercase and uppercase letters, and have a length minimum 6 characters, but not more than 12'
        errors.isValid = false
    }
}
const validateUserName = (errors, reqData) => {
    if(!reqData.userName)
    {
        errors.userName = 'User name is required'
        errors.isValid = false
    }
}

const validateEmail = (errors, reqData) => {
    const emailRegex = /@/g
    const isEmail = reqData.email.match(emailRegex)
    if(!isEmail){
        errors.email = 'Enter a valid email'
        errors.isValid = false
    }
}
const validateLastName = (errors, reqData) => {
    if(!reqData.lastName)
    {
        errors.lastName = 'Last name is required'
        errors.isValid = false
    } 
}
const validateFirstName = (errors, reqData) => {
    if(!reqData.firstName)
    {
        errors.firstName = 'First name is required'
        errors.isValid = false
    }
}