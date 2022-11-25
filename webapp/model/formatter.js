sap.ui.define([], function () {
	"use strict";
	return {
		prdordDate: function (podate) {
            var dispFormat=sap.ui.getCore().getConfiguration().getFormatSettings().getDatePattern("medium");
            if(podate){
               /**var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern : dispFormat
                });**/
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: dispFormat+"THH:mm" ,UTC:false});
                //"dd.MM.yyyy"
                // setDisplayFormat(sap.ui.getCore().getConfiguration().getFormatSettings().getDatePattern("medium"));
                var pDate = oDateFormat.format(podate);
            }
            return pDate;
        }
    };
});