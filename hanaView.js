sap.ui.jsview("usermanagementinterface.userListView", {

	/**
	 * Specifies the Controller belonging to this View. In the case that it is
	 * not implemented, or that "null" is returned, this View does not have a
	 * Controller.
	 * 
	 * @memberOf usermanagementinterface.userListView
	 */
	getControllerName : function() {
		return "usermanagementinterface.userListView";
	},

	/**
	 * Is initially called once after the Controller has been instantiated. It
	 * is the place where the UI is constructed. Since the Controller is given
	 * to this method, its event handlers can be attached right away.
	 * 
	 * @memberOf usermanagementinterface.userListView
	 */
	createContent : function(oController) {

		// Create a model
		var oLayout = new sap.ui.commons.layout.MatrixLayout();
		var oModel = new sap.ui.model.odata.ODataModel(
				"../../../Services/userManage.xsodata", false);

		var updatePanel = new sap.ui.commons.Panel("updPanel")
				.setText('New User Record Details');
		var layoutNew = new sap.ui.commons.layout.MatrixLayout({
			width : "auto"
		});

		var oVal1 = new sap.ui.commons.TextField("firstName", {
			tooltip : "First Name",
			width : "200px",
			editable : true
		});
		var oVal2 = new sap.ui.commons.TextField("lastName", {
			tooltip : "Last Name",
			width : "200px",
			editable : true
		});
		var oVal3 = new sap.ui.commons.TextField("email", {
			tooltip : "Email",
			width : "200px",
			editable : true
		});
		var oVal4 = new sap.ui.commons.TextField("gender", {
			tooltip : "Gender",
			width : "200px",
			editable : true
		});
		var oVal5 = new sap.ui.commons.TextField("team", {
			tooltip : "Team",
			width : "200px",
			editable : true
		});
		var oVal6 = new sap.ui.commons.TextField("relationship", {
			tooltip : "Relationship",
			width : "200px",
			editable : true
		});
		var oVal7 = new sap.ui.commons.TextField("accountNumber", {
			tooltip : "Account Number",
			width : "200px",
			editable : true
		});
		var oVal8 = new sap.ui.commons.TextField("firm", {
			tooltip : "Firm",
			width : "200px",
			editable : true
		});
		var oVal9 = new sap.ui.commons.TextField("role", {
			tooltip : "Role",
			width : "200px",
			editable : true
		});
		var oVal10 = new sap.ui.commons.TextField("userName", {
			tooltip : "User Name",
			width : "200px",
			editable : true
		});
		var oVal11 = new sap.ui.commons.TextField("password", {
			tooltip : "Password",
			width : "200px",
			editable : true
		});
		var oVal12 = new sap.ui.commons.TextField("isInvited", {
			tooltip : "Already Invited",
			width : "200px",
			editable : true
		});
		var oExcButton = new sap.ui.commons.Button({
			text : "Create Record",
			press : oController.callUserService
		});
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "First Name:"
		}), oVal1); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Last Name:"
		}), oVal2); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Email:"
		}), oVal3); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Gender:"
		}), oVal4); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Team:"
		}), oVal5);// oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Relationship:"
		}), oVal6); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Account Number:"
		}), oVal7); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Firm:"
		}), oVal8); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Role:"
		}), oVal9); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "User Name:"
		}), oVal10); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Password:"
		}), oVal11); // oExcButton );
		layoutNew.createRow(new sap.ui.commons.Label({
			text : "Already Invited:"
		}), oVal12, oExcButton);

		updatePanel.addContent(layoutNew);
		oLayout.createRow(updatePanel);

		var oControl;
		// Create an instance of the table control
		oTable = new sap.ui.table.Table("users", {
			tableId : "tableId",
			visibleRowCount : 10,
			toolbar : new sap.ui.commons.Toolbar({
				items : [
				new sap.ui.commons.Button({
					text : "Edit",
					press : oController.userUpdate
				}), new sap.ui.commons.Button({
					text : "Delete",
					press : oController.userDelete
				}) ]
			})
		});
		oTable.setTitle("Users");

		oControl = new sap.ui.commons.TextField().bindProperty("value",
				"firstName");
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "First Name"
			}),
			template : oControl,
			sortProperty : "firstName",
			filterProperty : "firstName",
			width : "100px"
		}));
		oControl = new sap.ui.commons.TextField().bindProperty("value",
				"lastName");
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "Last Name"
			}),
			template : oControl,
			sortProperty : "lastName",
			filterProperty : "lastName",
			width : "100px"
		}));
		oControl = new sap.ui.commons.TextField().bindProperty("value",
				"gender");
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "Gender"
			}),
			template : oControl,
			sortProperty : "gender",
			filterProperty : "gender",
			width : "100px"
		}));
		oControl = new sap.ui.commons.TextField()
				.bindProperty("value", "email");
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "E-Mail"
			}),
			template : oControl,
			sortProperty : "email",
			filterProperty : "email",
			width : "100px"
		}));
		oControl = new sap.ui.commons.TextField().bindProperty("value",
				"userName");
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "User ID"
			}),
			template : oControl,
			sortProperty : "userName",
			filterProperty : "userName",
			width : "100px"
		}));
		oControl = new sap.ui.commons.TextField().bindProperty("value",
				"relationship");
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "Relationship"
			}),
			template : oControl,
			sortProperty : "relationship",
			filterProperty : "relationship",
			width : "100px"
		}));
		oControl = new sap.ui.commons.TextField().bindProperty("value",
				"isInvited");
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "Already Invited"
			}),
			template : oControl,
			sortProperty : "isInvited",
			filterProperty : "isInvited",
			width : "100px"
		}));

		// Create a model and bind the table rows to this model
		// var oModel = new sap.ui.model.json.JSONModel();
		// oModel.setData({modelData: aData});
		oTable.setModel(oModel);
		oTable.bindRows("/UsersEntity");

		// Initially sort the table
		oTable.sort(oTable.getColumns()[0]);

		// Bring the table onto the UI
		oTable.placeAt("sample1");
		oLayout.createRow(oTable);

		return oLayout;

	}

});