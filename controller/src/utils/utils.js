exports.formatDate = (date) => {
    if(typeof date == 'string'){
        date = new Date(date);
    }
//    console.log('----------------------', date)
    let year = date.getFullYear();
    let month = exports.enforceDigits(date.getMonth() + 1, 2);
    let day = exports.enforceDigits(date.getDate(), 2);
    let hour = exports.enforceDigits(date.getHours(), 2);
    let minute = exports.enforceDigits(date.getMinutes(), 2);
    let seconds = exports.enforceDigits(date.getSeconds(), 2);
    let milSeconds = exports.enforceDigits(date.getMilliseconds(), 3);
    let value =  `${year}-${month}-${day}T${hour}:${minute}:${seconds}.${milSeconds}`
 //   console.log('value &&&&&&&&&&&&&&&&& ', 'MilSecs', milSeconds, 'Secs', seconds, 'Min.', minute, 'Hour', hour, 'Day', day, 'Month', month, 'Year', year, value)
    return value;
}

// method that turns int value to digits number of digits
exports.enforceDigits = function(num, digits){
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