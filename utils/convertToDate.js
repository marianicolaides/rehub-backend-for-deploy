const convertStringToDate = function(dateString) {
    var dateParts = dateString.split('/');
    var formattedDate = dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2];
    var date = new Date(formattedDate);
    return date;
}

module.exports.convertStringToDate = convertStringToDate