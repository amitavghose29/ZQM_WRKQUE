/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comairbus/zqm_wrkque/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
