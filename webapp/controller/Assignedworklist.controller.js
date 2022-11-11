sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/Fragment'
], function (Controller, Fragment) {
	"use strict";

	return Controller.extend("com.airbus.zqmwrkque.controller.Assignedworklist", {
		onInit: function () {

		},
		onPressCopy:function(){
			var oView = this.getView();
			var tab = this.getView().byId("idProductsTable").getSelectedItems();
			if(tab.length === 0){
				this._pValueHelpDialog = Fragment.load({
					id: oView.getId(),
					name: "com.airbus.zqmwrkque.fragments.CopyNcr",
					controller: this
				}).then(function (oValueHelpDialog) {
					oView.addDependent(oValueHelpDialog);
					return oValueHelpDialog;
				});
					this._pValueHelpDialog.then(function (oValueHelpDialog) {
				// open value help dialog
				oValueHelpDialog.open();
			});
			}else{
				
			}
		},
		handleValueHelp: function (oEvent) {
			var oView = this.getView();
			this.inputId = oEvent.getSource().getId();

			// create value help dialog
			if (!this._pValueHelpDialog) {
				this._pValueHelpDialog = Fragment.load({
					id: oView.getId(),
					name: "com.airbus.zqmwrkque.fragments.workcenter",
					controller: this
				}).then(function (oValueHelpDialog) {
					oView.addDependent(oValueHelpDialog);
					return oValueHelpDialog;
				});
			}

			this._pValueHelpDialog.then(function (oValueHelpDialog) {
				// open value help dialog
				oValueHelpDialog.open();
			});
		},
	});
});