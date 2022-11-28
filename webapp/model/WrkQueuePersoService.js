sap.ui.define(['sap/ui/thirdparty/jquery'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var WrkQueuePersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "wrkQueueApp-wrkQueueTable-ncrCol",
					order: 0,
					text: "NCR Number",
					visible: true
				},
				{
					id: "wrkQueueApp-wrkQueueTable-discCol",
					order: 1,
					text: "Disc No",
					visible: true
				},
				{
					id: "wrkQueueApp-wrkQueueTable-nctypCol",
					order: 2,
					text: "NCR Types",
					visible: true
				},
				{
					id: "wrkQueueApp-wrkQueueTable-compCol",
					order: 3,
					text: "Component No",
					visible: true
				},
				{
					id: "wrkQueueApp-wrkQueueTable-rncCol",
					order: 4,
					text: "RNC Priority",
					visible: false
				},
                {
					id: "wrkQueueApp-wrkQueueTable-locCol",
					order: 5,
					text: "Location Part",
					visible: false
				},
                {
					id: "wrkQueueApp-wrkQueueTable-detworkCol",
					order: 6,
					text: "Det. Work Center",
					visible: false
				},
                {
					id: "wrkQueueApp-wrkQueueTable-detectedCol",
					order: 7,
					text: "Detected Date",
					visible: false
				}
			]
		},

		oResetData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "wrkQueueApp-wrkQueueTable-ncrCol",
					order: 0,
					text: "NCR Number",
					visible: true
				},
				{
					id: "wrkQueueApp-wrkQueueTable-discCol",
					order: 1,
					text: "Disc No",
					visible: false
				},
				{
					id: "wrkQueueApp-wrkQueueTable-nctypCol",
					order: 2,
					text: "NCR Types",
					visible: false
				},
				{
					id: "wrkQueueApp-wrkQueueTable-compCol",
					order: 3,
					text: "Component No",
					visible: false
				},
				{
					id: "wrkQueueApp-wrkQueueTable-rncCol",
					order: 4,
					text: "RNC Priority",
					visible: false
				},
                {
					id: "wrkQueueApp-wrkQueueTable-locCol",
					order: 5,
					text: "Location Part",
					visible: false
				},
                {
					id: "wrkQueueApp-wrkQueueTable-detworkCol",
					order: 6,
					text: "Det. Work Center",
					visible: false
				},
                {
					id: "wrkQueueApp-wrkQueueTable-detectedCol",
					order: 7,
					text: "Detected Date",
					visible: false
				}
			]
		},


		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			oDeferred.resolve(this._oBundle);
			// setTimeout(function() {
			// 	oDeferred.resolve(this._oBundle);
			// }.bind(this), 2000);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		getResetPersData : function () {
			var oDeferred = new jQuery.Deferred();

			// oDeferred.resolve(this.oResetData);

			setTimeout(function() {
				oDeferred.resolve(this.oResetData);
			}.bind(this), 2000);

			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();

			//set personalization
			this._oBundle = this.oResetData;

			//reset personalization, i.e. display table as defined
			//this._oBundle = null;

			oDeferred.resolve();

			// setTimeout(function() {
			// 	this._oBundle = this.oResetData;
			// 	oDeferred.resolve();
			// }.bind(this), 2000);

			return oDeferred.promise();
		},

		
	};

	return WrkQueuePersoService;

});