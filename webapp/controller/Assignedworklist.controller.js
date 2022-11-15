sap.ui.define([
	'sap/m/TablePersoController',
	'../model/WrkQueuePersoService',
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/Fragment'
], function (TablePersoController, WrkQueuePersoService,Controller, Fragment) {
	"use strict";
    //var ResetAllMode =  mlibrary.ResetAllMode;
	return Controller.extend("com.airbus.zqmwrkque.controller.Assignedworklist", {
		onInit: function () {
			this._oTPC = new TablePersoController({
				table: this.byId("wrkQueueTable"),
				componentName: "wrkQueueApp",
				//resetAllMode: ServiceReset,
				persoService: WrkQueuePersoService
			}).activate();

		},
		onExit: function () {
			this._oTPC.destroy();
		},
		onCreate: function(oEvent){
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
			target: {
			semanticObject: "zqmncr",
			action: "display"
			}
			})) || "";
			oCrossAppNavigator.toExternal({
			target: {
			shellHash: hash
			}
			});


		},
		handleSelectionChange: function(oEvent){
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
		},
		onPressCopy:function(oEvent){
          
		  var oView = this.getView();
			var tab = this.getView().byId("wrkQueueTable").getSelectedItems();
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
				var oNotificationNumber=tab[0].getCells()[0].mProperties.text;
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				   target : { shellHash : "zqmncr-display&/Ncheader/"+oNotificationNumber}
				  })) || "";
				oCrossAppNavigator.toExternal({
					target: {
					  shellHash: hash
					}
				  });   
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
        onPersoButtonPressed: function (oEvent){
			this._oTPC.openDialog();

		},
		handleFilterButtonPressed: function(oEvent){
			if (!this.oFilterFragment) {
				this.oFilterFragment = sap.ui.xmlfragment("filterFragment", "com.airbus.zqmwrkque.fragments.FilterDialog", this);
				this.getView().addDependent(this.oFilterFragment);
			  }
			  this.oFilterFragment.open();

		},
		onFilter: function (oEvent) {
			if (oEvent) {
				this.columnText = oEvent.getParameters().sortItem.getText();
				this.columnKey = oEvent.getParameters().sortItem.getKey();
				this.bDesc = oEvent.getParameters().sortDescending;
			  }
			  var oSorter = new sap.ui.model.Sorter(this.columnKey, this.bDesc);
			  if (this.columnKey === "Ncr" || this.columnKey === "Disc") {
				
				if (this.columnKey === "Ncr") {
				 
				}
			  }
			  var oTable = this.byId("wrkQueueTable");
			  //this.byId("wrkQueueTable")
			  oTable.getBinding("items").sort(oSorter);
			  this.byId("idbuttonfilter").setIcon(this.bDesc ? 'sap-icon://sort-descending' :
				'sap-icon://sort-ascending');




		}

	});
});