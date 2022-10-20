const dobValidator = dob => {
    if (dob.length !== 10) return false;
    if (dob.charAt(2) !== "-" || dob.charAt(5) !== "-") return false;
  
    return true;
  }

  module.exports = {
    dobValidator
  }