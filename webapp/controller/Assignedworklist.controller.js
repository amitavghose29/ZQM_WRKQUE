sap.ui.define([
	'sap/m/TablePersoController',
	'../model/WrkQueuePersoService',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/Fragment'
], function (TablePersoController, WrkQueuePersoService,Filter,FilterOperator,Controller,JSONModel,Fragment) {
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

        onSaveNote: function(oEvent){
            var tab = this.getView().byId("wrkQueueTable").getSelectedItems();
            var ncr=tab[0].getCells()[0].mProperties.text;
            //Call OData to Save note for selected NC Number
        },

        onPressEdit: function(oEvent){
            var tab = this.getView().byId("wrkQueueTable").getSelectedItems();
            var ncr=tab[0].getCells()[0].mProperties.text;
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				                  target : { shellHash : "zqmncr-display&/Ncheader/"+ncr}
				                })) || "";
				                oCrossAppNavigator.toExternal({
					             target: {
					             shellHash: hash
					             }
				                });  

        },
		onPressCopy:function(oEvent){
          
		  var oView = this.getView();
			var tab = this.getView().byId("wrkQueueTable").getSelectedItems();
			var saveData = {};
			if(tab.length === 0){
				/**this._pValueHelpDialog = Fragment.load({
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

			});**/
			this._oNCDialog = sap.ui.xmlfragment("com.airbus.zqmwrkque.fragments.CopyNcr", this);
            this.getView().addDependent(this._oNCDialog);
            this._oNCDialog.open();
            this._oNCDialog.setModel(this.getOwnerComponent().getModel());
			}else{
				var ncCopy=tab[0].getCells()[0].mProperties.text;
				var payload = {
                    Notification: ncCopy,
                    "Message": ""
                };
                var entityset = "/CopyNotificationSet"; 

				var oModel = this.getOwnerComponent().getModel();
                oModel.create(entityset, payload, {
                    success: function (data) {
                       // MessageBox.success(data.Message, {
                           // onClose: function () {
                                sap.ui.core.BusyIndicator.show();
                                saveData = payload;
                                saveData.NotifNo = data.Notification;
                                var jsonModel = new JSONModel();
                                jsonModel.setData(saveData);
                                this.getOwnerComponent().setModel(jsonModel, "NCSaveModel");
								var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				                  target : { shellHash : "zqmncr-display&/Ncheader/"+data.Notification}
				                })) || "";
				                oCrossAppNavigator.toExternal({
					             target: {
					             shellHash: hash
					             }
				                });  
                   
                                sap.ui.core.BusyIndicator.hide();
                               
                           // }.bind(this)
                       // });
                    }.bind(this),
                    error: function (oError) {
                        var msg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(msg);
                    }
                });


				 
			}
		},

		 /**
        * Function is triggered when the go button in filter bar of NC Number Value Help dialog is clicked
        * @function
        */
		  onFilterBarSearchCopyNC: function () {
            sap.ui.core.BusyIndicator.show();
            var oModel = new JSONModel();
            oModel.setSizeLimit(10000);
            var oDataModel = this.getOwnerComponent().getModel();
            var sValNotif = sap.ui.getCore().byId("idFBNcNum").getValue();
            var sValSerNo = sap.ui.getCore().byId("idFBSerNo").getValue();
            var sValAircraft = sap.ui.getCore().byId("idFBAircraft").getValue();
            var oFilter = [];
            if(sValNotif != ""){
                oFilter.push(new Filter("Notification", FilterOperator.EQ, sValNotif));
            } if (sValSerNo != ""){
                oFilter.push(new Filter("SerialNumber", FilterOperator.EQ, sValSerNo));
            } if(sValAircraft != ""){   
               oFilter.push(new Filter("Aircraft", FilterOperator.EQ, sValAircraft));
            }
            var sPath = "/NCSearchSet"
            oDataModel.read(sPath, {
                filters: oFilter,
                success: function (oData, oResult) {
                    var data = oData.results;
                    oModel.setData(data);
                    sap.ui.getCore().byId("idCopyNCTable").setModel(oModel, "oNcCopyModel");
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });
        },
		 /**
        * Function is fired when the value help indicator for notification number as in filter bar field of NC Number Value Help dialog is clicked 
        * @function
        * @param {sap.ui.base.Event} oEvent source of the input 
        */
		  onNCNoFBVHRequest: function (oEvent) {
            this._oNCNoFBVHDialog = sap.ui.xmlfragment("com.airbus.zqmwrkque.fragments.NcNumFBVH", this);
            this.getView().addDependent(this._oNCNoFBVHDialog);
            this._oNCNoFBVHDialog.open();
            this.oInputNcNoFB = oEvent.getSource();
            sap.ui.core.BusyIndicator.show();
            var oModel = new JSONModel();
            oModel.setSizeLimit(10000);
            var oDataModel = this.getOwnerComponent().getModel();
            var oFilter = [];
            oFilter.push(new Filter("Key", FilterOperator.EQ, "NOTIF"));
            var sPath = "/f4_genericSet"
            oDataModel.read(sPath, {
                filters: oFilter,
                success: function (oData, oResult) {
                    sap.ui.core.BusyIndicator.hide();
                    var data = oData.results;
                    oModel.setData(data);
                    this._oNCNoFBVHDialog.setModel(oModel, "oNcNumFBModel");
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });
        },
		 /**
        * Function is triggered when the value help indicator for Serial Number as in filter bar field of NC Number Value Help is clicked
        * @function
        * @param {sap.ui.base.Event} oEvent source of the input
        */
		  onSerNoFBVHRequest: function (oEvent) {
            this._oSerNoFBVHDialog = sap.ui.xmlfragment("com.airbus.zqmwrkque.fragments.SerNumFBVH", this);
            this.getView().addDependent(this._oSerNoFBVHDialog);
            this._oSerNoFBVHDialog.open();
            this.oInputSerNoFB = oEvent.getSource();
            sap.ui.core.BusyIndicator.show();
            var oModel = new JSONModel();
            oModel.setSizeLimit(10000);
            var oDataModel = this.getOwnerComponent().getModel();
            var oFilter = [];
            oFilter.push(new Filter("Key", FilterOperator.EQ, "SERNR"));
            var sPath = "/f4_genericSet"
            oDataModel.read(sPath, {
                filters: oFilter,
                success: function (oData, oResult) {
                    sap.ui.core.BusyIndicator.hide();
                    var data = oData.results;
                    oModel.setData(data);
                    this._oSerNoFBVHDialog.setModel(oModel, "oSerNoFBModel");
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });
        },
		 /**
        * Function is triggered when the value help indicator for Aircraft Number is clicked
        * @function
        * @param {sap.ui.base.Event} oEvent source of input
        */
		  onAircrafthelpRequest: function (oEvent) {
            this._oAircraftDialog = sap.ui.xmlfragment("AircraftfragId", "com.airbus.zqmwrkque.fragments.AircraftValueHelp", this);
            this.getView().addDependent(this._oAircraftDialog);
            this._oAircraftDialog.open();
            this.oAirCraftInput = oEvent.getSource();
            //F4 Aircraft No s 
            sap.ui.core.BusyIndicator.show();
            var oModel = new JSONModel();
            oModel.setSizeLimit(10000);
            var oDataModel = this.getOwnerComponent().getModel();
            var oFilter = [];
            oFilter.push(new Filter("Key", FilterOperator.EQ, "AIR"));
            var sPath = "/f4_genericSet"
            oDataModel.read(sPath, {
                filters: oFilter,
                success: function (oData, oResult) {
                    sap.ui.core.BusyIndicator.hide();
                    var data = oData.results;
                    oModel.setData(data);
                    this._oAircraftDialog.setModel(oModel, "oAircrafttNoModel");
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });
        },
		 /**
        * Function is triggered when nc number selection is changed via user interaction inside the control
        * @function
        * @param {sap.ui.base.Event} oEvent item being selected is returned 
        */
		  handleCloseUserValueHelpNCcopy: function (oEvent) {
            var saveData = {};
            var ncCopy = oEvent.getParameters("selectedItem").listItem.getBindingContext("oNcCopyModel").getProperty("Notification");
             /**var oInput = this.getView().byId("idncrnumber");
            if (!oSelectedItem) {
                oInput.resetProperty("value");
                return;
            }
            oInput.setValue(oSelectedItem);**/
            var payload = {
                Notification: ncCopy,
                "Message": ""
            };
            var entityset = "/CopyNotificationSet"; 

            var oModel = this.getOwnerComponent().getModel();
            oModel.create(entityset, payload, {
                success: function (data) {
                   // MessageBox.success(data.Message, {
                       // onClose: function () {
                            sap.ui.core.BusyIndicator.show();
                            saveData = payload;
                            saveData.NotifNo = data.Notification;
                            var jsonModel = new JSONModel();
                            jsonModel.setData(saveData);
                            this.getOwnerComponent().setModel(jsonModel, "NCSaveModel");
                            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                              target : { shellHash : "zqmncr-display&/Ncheader/"+data.Notification}
                            })) || "";
                            oCrossAppNavigator.toExternal({
                             target: {
                             shellHash: hash
                             }
                            });  
               
                            sap.ui.core.BusyIndicator.hide();
                           
                       // }.bind(this)
                   // });
                }.bind(this),
                error: function (oError) {
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });


            this._oNCDialog.close();
            this._oNCDialog.destroy();
        },
		 /**
        * Function is triggered when the NC Copy Dialog is closed
        * @function
        */
		  _handleNCCopyVHClose: function () {
            this._oNCDialog.close();
            this._oNCDialog.destroy();
        },
        /**
        * Function is fired when the value of the input is changed - e.g. at each keypress for Notification Number as in filter bar field of NC Number Value Help
        * @function
        * @param {sap.ui.base.Event} oEvent object of the user input
        */
         onNcNoFBLiveSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Value", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        /**
        * Function is fired when the notification number as in filter bar field of NC Number Value Help dialog is confirmed by selecting an item 
        * @function
        * @param {sap.ui.base.Event} oEvent item being selected is returned 
        */
         _confirmNcNoFBValueHelpDialog: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem"),
                oInput = this.oInputNcNoFB;
            if (!oSelectedItem) {
                oInput.resetProperty("value");
                return;
            }
            oInput.setValue(oSelectedItem.getTitle());
            this._oNCNoFBVHDialog.destroy();
        },
         /**
        * Function is fired when the value of the input is changed - e.g. at each keypress for Serial Number as in filter bar field of NC Number Value Help
        * @function
        * @param {sap.ui.base.Event} oEvent object of the user input
        */
          onSerNoFBLiveSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Value", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        /**
        * Function is fired when the serial number as in filter bar field of NC Number Value Help dialog is confirmed by selecting an item 
        * @function
        * @param {sap.ui.base.Event} oEvent item being selected is returned 
        */
         _confirmSerNoFBValueHelpDialog: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem"),
                oInput = this.oInputSerNoFB;
            if (!oSelectedItem) {
                oInput.resetProperty("value");
                return;
            }
            oInput.setValue(oSelectedItem.getTitle());
            this._oSerNoFBVHDialog.destroy();
        },
        /**
        * Function is executed when the live search for Aircraft Number is triggered
        * @function
        * @param {sap.ui.base.Event} oEvent object of the user input    
        */
         onAircraftliveSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Value", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        /**
        * Function is executed when the search for Aircraft Number is triggered
        * @function
        * @param {sap.ui.base.Event} oEvent object of the user input    
        */
         _confirmAircraftValueHelpDialog: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem"),
                oInput = this.oAirCraftInput;
            if (!oSelectedItem) {
                oInput.resetProperty("value");
                return;
            }
            oInput.setValue(oSelectedItem.getTitle());
            this._oAircraftDialog.destroy();
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
                oSorter.fnCompare = function (value1, value2) {
                    value2 = parseInt(value2);
                    value1 = parseInt(value1);
                    if (value1 < value2) {
                      return -1;
                    }
                    if (value1 == value2) {
                      return 0;
                    }
                    if (value1 > value2) {
                      return 1;
                    }
                  };
				
				/**if (this.columnKey === "Ncr") {
				 
				}**/
			  }
			  var oTable = this.byId("wrkQueueTable");
			  //this.byId("wrkQueueTable")
			  oTable.getBinding("items").sort(oSorter);
			  this.byId("idbuttonfilter").setIcon(this.bDesc ? 'sap-icon://sort-descending' :
				'sap-icon://sort-ascending');




		}

	});
});