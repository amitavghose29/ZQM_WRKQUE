sap.ui.define([
	'sap/m/TablePersoController',
	'../model/WrkQueuePersoService',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'sap/m/Dialog',
    'sap/m/TextArea',
    'sap/m/DialogType',
    'sap/m/ButtonType',
    'sap/m/Button',
    'sap/m/MessageBox',
	'sap/ui/core/Fragment',
    "../model/formatter"
], function (TablePersoController, WrkQueuePersoService,Filter,FilterOperator,Controller,JSONModel,Dialog,TextArea,DialogType,ButtonType,Button,MessageBox,Fragment,formatter) {
	"use strict";
    //var ResetAllMode =  mlibrary.ResetAllMode;
	return Controller.extend("com.airbus.zqmwrkque.controller.Assignedworklist", {
        formatter: formatter,
		onInit: function () {
          var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
          var oStartUpParameters = sap.ui.component(sComponentId).getComponentData().startupParameters;
          this.oAppTitle=oStartUpParameters.App[0];
          this.getView().byId("page").setTitle(this.oAppTitle);
            this.bDesc = true;
            var oCancelBtn="";
			this._oTPC = new TablePersoController({
				table: this.byId("wrkQueueTable"),
				componentName: "wrkQueueApp",
				//resetAllMode: ServiceReset,
				persoService: WrkQueuePersoService
			}).activate();
            if (sap.ui.getCore().getModel("cancelModel")) {
                if ((sap.ui.getCore().getModel("cancelModel").oData.ModeBtn != "")) {  
                    oCancelBtn=sap.ui.getCore().getModel("cancelModel").oData.ModeBtn;
                
                }
            }
            if(oCancelBtn == "CANCEL"){
                this.getView().byId("wrkQueueTable").setModel(sap.ui.getCore().getModel("workListModel"), "oWorklistModel");
            }else{
                sap.ui.core.BusyIndicator.show();
                var oModel = new JSONModel();
                oModel.setSizeLimit(10000);
                var oDataModel = this.getOwnerComponent().getModel();
                var sPath = "/WorkingQueueRepSet"
                    oDataModel.read(sPath, {
                       success: function (oData, oResult) {
                             var data = oData.results;
                             oModel.setData(data);
                             this.getView().byId("wrkQueueTable").setModel(oModel, "oWorklistModel");
                             sap.ui.core.BusyIndicator.hide();
                         }.bind(this),
                        error: function (oError) {
                              sap.ui.core.BusyIndicator.hide();
                              var msg = JSON.parse(oError.responseText).error.message.value;
                              MessageBox.error(msg);
                         }
                       });

            }
		},
		onExit: function () {
			this._oTPC.destroy();
            //sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel([]), "modeModel");
            var modeData = {};
            modeData.ModeBtn = "";
            var modeModel = new JSONModel();
            modeModel.setData(modeData);
            sap.ui.getCore().setModel(modeModel, "cancelModel");
		},
        
        onSearchWorkCenterFB: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Value", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        _handleConfirmWorkCenterFB: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem"),
                oInput = this.oInpWrkCntFB;
            if (!oSelectedItem) {
                oInput.resetProperty("value");
                return;
            }
            oInput.setValue(oSelectedItem.getTitle());
            this._oWrkCntFBDialog.destroy();
        },

        handleUnSelect: function(oEvent){
            this.getView().byId("wrkQueueTable").removeSelections();

        },
        onWorklistSearch: function (oEvent){
            sap.ui.core.BusyIndicator.show();
            var oModel = new JSONModel();
            oModel.setSizeLimit(10000);
            var oDataModel = this.getOwnerComponent().getModel();
            var sShowAllGroupSel = this.getView().byId("chkShowGrp").getSelected();
            var sShowAllUserpSel = this.getView().byId("chkShowUsr").getSelected();
            var sUnassignedSel =   this.getView().byId("chkShowUnAs").getSelected();
            var sValWorkCenter =   this.getView().byId("idWC").getValue();
            var sValProdSequence=  this.getView().byId("idProdSeq").getValue();
            var oFilter = [];
            if(sShowAllGroupSel){
                    oFilter.push(new Filter("Groups", FilterOperator.EQ, 'X'));
            }
            if (sShowAllUserpSel){
                    oFilter.push(new Filter("AllUsers", FilterOperator.EQ, 'X'));
            }
            if(sUnassignedSel){   
                   oFilter.push(new Filter("UnAssigned", FilterOperator.EQ, 'X'));
            }
            if(sValWorkCenter != ""){
                    oFilter.push(new Filter("WorkCenter", FilterOperator.EQ, sValWorkCenter));
            } 
            if (sValProdSequence != ""){
                    oFilter.push(new Filter("ProductSequence", FilterOperator.EQ, sValProdSequence));
            }
            var sPath = "/WorkingQueueRepSet"
                oDataModel.read(sPath, {
                    filters: oFilter,
                    success: function (oData, oResult) {
                        var data = oData.results;
                        oModel.setData(data);
                       this.getView().byId("wrkQueueTable").setModel(oModel, "oWorklistModel");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this),
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        var msg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(msg);
                    }
                });
                  
        },

        onSearchProdSeqFB: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Value", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        _handleConfirmProdSeqFB: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem"),
                oInput = this.oInpPrdSeqFB;
            if (!oSelectedItem) {
                oInput.resetProperty("value");
                return;
            }
            oInput.setValue(oSelectedItem.getTitle());
            this._oProdSeqFBDialog.destroy();
        },
        
        openNotePopUp: function(oEvent){
            var tab = this.getView().byId("wrkQueueTable").getSelectedItems();
			if(tab.length > 0){
                if (!this.oNoteMessageDialog) {
                    this.oNoteMessageDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Note",
                        content: new TextArea({placeholder:"Enter text",maxLength:100}),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "OK",
                            press: function (oEvent) {
                                var oComment=oEvent.getSource().getParent().getContent()[0].mProperties.value;
                                this.onSaveNote(oComment);
                                this.oNoteMessageDialog.close();
                            }.bind(this)
                        })
                    });
                }
    
                this.oNoteMessageDialog.open();

            }else{
                MessageBox.alert("Please select the NC Number Line Item");

            }
          
        },
		onCreate: function(oEvent){
            var modeData = {};
            modeData.ModeBtn = "CREATE";
            var modeModel = new JSONModel();
            modeModel.setData(modeData);
            sap.ui.getCore().setModel(modeModel, "modeModel");
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

        onSaveNote: function(oComment){
            var ncr=this.getView().byId("wrkQueueTable").getSelectedItem().getBindingContext("oWorklistModel").getProperty("Notificatioin");
            var oDiscrepancy = this.getView().byId("wrkQueueTable").getSelectedItem().getBindingContext("oWorklistModel").getProperty("DiscNo");
           var oCommentPayload = {
                "Discrepancy": oDiscrepancy,
                "Comments": oComment
            };
            this.getOwnerComponent().getModel().update("/WorkQueueCommentSet('" + ncr + "')", oCommentPayload,{
              method: "PUT",
              success: function (oData, oResponse) {
                  MessageBox.success("Note Saved Successfully for NCR Number:"+" "+ncr);
            
              }.bind(this),
              error: function (oError) {
               var msg = JSON.parse(oError.responseText).error.message.value;
                MessageBox.error(msg);
              }

              });
            
            
            //tab[0].getCells()[0].mProperties.text;
            //Call OData to Save note for selected NC Number
        },

        onPressEdit: function(oEvent){
            var tab = this.getView().byId("wrkQueueTable").getSelectedItems();
            if(tab.length > 0){
                sap.ui.getCore().setModel(this.getView().byId("wrkQueueTable").getModel("oWorklistModel"), "workListModel");
                var ncr=this.getView().byId("wrkQueueTable").getSelectedItem().getBindingContext("oWorklistModel").getProperty("Notificatioin");
                //tab[0].getCells()[0].mProperties.text;
                var modeData = {};
                modeData.ModeBtn = "EDIT";

               // var pdata = "{\"modeBtn\":\"" + modeBtn + "\"}";
               // var pJsnObj = JSON.parse(pdata);
                var modeModel = new JSONModel();
                modeModel.setData(modeData);
                sap.ui.getCore().setModel(modeModel, "modeModel");
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                                    var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                                      target : { shellHash : "zqmncr-display&/Ncheader/"+ncr}
                                     
                                    })) || "";
                                    oCrossAppNavigator.toExternal({
                                     target: {
                                     shellHash: hash
                                     }
                                    });  
            }else{
                MessageBox.alert("Please select the NC Number Line Item.");
            }
           

        },
		onPressCopy:function(oEvent){
          
		  var oView = this.getView();
			var tab = this.getView().byId("wrkQueueTable").getSelectedItems();
            sap.ui.getCore().setModel(this.getView().byId("wrkQueueTable").getModel("oWorklistModel"), "workListModel");
			var saveData = {};
			if(tab.length === 0){
                //MessageBox.alert("Please select the NC Number Line Item.");
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
            sap.ui.core.BusyIndicator.show();
            var oModelSer = new JSONModel();
            var oModelNotif = new JSONModel();
            var oModelAir = new JSONModel();
            oModelSer.setSizeLimit(10000);
            oModelNotif.setSizeLimit(10000);
            oModelAir.setSizeLimit(10000);
            var oDataModel = this.getOwnerComponent().getModel();
            var oFilterSernr = [];
            oFilterSernr.push(new Filter("Key", FilterOperator.EQ, "SERNR"));
            var oFilterNotif = [];
            oFilterNotif.push(new Filter("Key", FilterOperator.EQ, "NOTIF"));
            var oFilterAir = [];
            oFilterAir.push(new Filter("Key", FilterOperator.EQ, "AIR"));
            var sPath = "/f4_genericSet"
            oDataModel.read(sPath, {
                filters: oFilterSernr,
                success: function (oData, oResult) {
                    sap.ui.core.BusyIndicator.hide();
                    var data = oData.results;
                    oModelSer.setData(data);
                    sap.ui.getCore().byId("idFBSerNo").setModel(oModelSer, "oSerNoSuggModel");
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });

            oDataModel.read(sPath, {
                filters: oFilterNotif,
                success: function (oData, oResult) {
                    sap.ui.core.BusyIndicator.hide();
                    var data = oData.results;
                    oModelNotif.setData(data);
                    sap.ui.getCore().byId("idFBNcNum").setModel(oModelNotif, "oNcNumSuggModel");
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });

            oDataModel.read(sPath, {
                filters: oFilterAir,
                success: function (oData, oResult) {
                    sap.ui.core.BusyIndicator.hide();
                    var data = oData.results;
                    oModelAir.setData(data);
                    sap.ui.getCore().byId("idFBAircraft").setModel(oModelAir, "oAircrafttNoSuggModel");
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });

			}else{

                var modeData = {};
                modeData.ModeBtn = "COPY";

               // var pdata = "{\"modeBtn\":\"" + modeBtn + "\"}";
               // var pJsnObj = JSON.parse(pdata);
                var modeModel = new JSONModel();
                modeModel.setData(modeData);
                sap.ui.getCore().setModel(modeModel, "modeModel");
				var ncCopy=this.getView().byId("wrkQueueTable").getSelectedItem().getBindingContext("oWorklistModel").getProperty("Notificatioin");
                //tab[0].getCells()[0].mProperties.text;
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
                            var modeData = {};
                            modeData.ModeBtn = "COPY";
                            var modeModel = new JSONModel();
                            modeModel.setData(modeData);
                            sap.ui.getCore().setModel(modeModel, "modeModel");
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



		handleValueHelpWC: function (oEvent) {
            this._oWrkCntFBDialog = sap.ui.xmlfragment("com.airbus.zqmwrkque.fragments.WorkCenterFBVH", this);
            this.getView().addDependent(this._oWrkCntFBDialog);
            this._oWrkCntFBDialog.open();
            this.oInpWrkCntFB = oEvent.getSource();
            sap.ui.core.BusyIndicator.show();
            var oModel = new sap.ui.model.json.JSONModel();
            var oDataModel = this.getOwnerComponent().getModel();
            var oFilter = [];
            oFilter.push(new Filter("Key", FilterOperator.EQ, "WRKCNTR"));
            var sPath = "/f4_genericSet";
            oDataModel.read(sPath, {
                filters: oFilter,
                success: function (oData, oResult) {
                    sap.ui.core.BusyIndicator.hide();
                    var data = oData.results;
                    oModel.setData(data);
                    this._oWrkCntFBDialog.setModel(oModel, "WrkCntModel");
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });
		},
        handleValueHelpPS: function (oEvent) {
            this._oProdSeqFBDialog = sap.ui.xmlfragment("com.airbus.zqmwrkque.fragments.ProdSeqFBVH", this);
            this.getView().addDependent(this._oProdSeqFBDialog);
            this._oProdSeqFBDialog .open();
            this.oInpPrdSeqFB = oEvent.getSource();
            sap.ui.core.BusyIndicator.show();
            var oModel = new sap.ui.model.json.JSONModel();
            var oDataModel = this.getOwnerComponent().getModel();
            var oFilter = [];
            oFilter.push(new Filter("Key", FilterOperator.EQ, "AIR"));
            var sPath = "/f4_genericSet";
            oDataModel.read(sPath, {
                filters: oFilter,
                success: function (oData, oResult) {
                    sap.ui.core.BusyIndicator.hide();
                    var data = oData.results;
                    oModel.setData(data);
                    this._oProdSeqFBDialog.setModel(oModel, "ProdSeqModel");
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }
            });
        },

        onPersoButtonPressed: function (oEvent){
			this._oTPC.openDialog();

		},
		handleSortButtonPressed: function(oEvent){
			if (!this.oFilterFragment) {
				this.oFilterFragment = sap.ui.xmlfragment("filterFragment", "com.airbus.zqmwrkque.fragments.FilterDialog", this);
				this.getView().addDependent(this.oFilterFragment);
			  }
			  this.oFilterFragment.open();

		},
		onSorter: function (oEvent) {
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
				
                  if (this.columnKey === "Ncr") {
                    var oSorterVal = new sap.ui.model.Sorter('Notificatioin', this.bDesc);
                    oSorter = [oSorterVal, oSorter];
                  }

                  if (this.columnKey === "Disc") {
                    var oSorterVal = new sap.ui.model.Sorter('DiscNo', this.bDesc);
                    oSorter = [oSorterVal, oSorter];
                  }
			  }
			  var oTable = this.getView().byId("wrkQueueTable");
			  //this.byId("wrkQueueTable")
			  oTable.getBinding("items").sort(oSorter);
			  this.byId("idbuttonsort").setIcon(this.bDesc ? 'sap-icon://sort-descending' :
				'sap-icon://sort-ascending');




		}

	});
});