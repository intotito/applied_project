// this function formats a date to a string in the format 'YYYY-MM-DDTHH:MM:SS.MMM'
exports.formatDate = (date) => {
    // catch string as date input
    if(typeof date == 'string'){
        date = new Date(date);
    }
    let year = date.getFullYear();
    let month = enforceDigits(date.getMonth() + 1, 2);
    let day = enforceDigits(date.getDate(), 2);
    let hour = enforceDigits(date.getHours(), 2);
    let minute = enforceDigits(date.getMinutes(), 2);
    let seconds = enforceDigits(date.getSeconds(), 2);
    let milSeconds = enforceDigits(date.getMilliseconds(), 3);
    let value =  `${year}-${month}-${day}T${hour}:${minute}:${seconds}.${milSeconds}`
    return value;
}

// method that turns int value to digits number of digits
enforceDigits = function(num, digits){
    let str = num.toString();
    while(str.length < digits){
        str = '0' + str;
    }
    return str;
}

// method that compares two dates
exports.compareDates = function(date1, date2){
    value =  date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();    
    return value;
}