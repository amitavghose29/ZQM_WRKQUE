/*global QUnit*/

sap.ui.define([
	"comairbus/zqm_wrkque/controller/Assignedworklist.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Assignedworklist Controller");

	QUnit.test("I should test the Assignedworklist controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
