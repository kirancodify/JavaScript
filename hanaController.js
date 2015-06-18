sap.ui
		.controller(
				"usermanagementinterface.userListView",
				{

					oModel : null,

					// onInit: function() {
					//
					// },
					
					// onBeforeRendering: function() {
					//
					// },
					
					// onAfterRendering: function() {
					//
					// },
					
					callUserService : function() {
						var oModel = new sap.ui.model.odata.ODataModel(
								"../../../Services/userManage.xsodata",
								true);
						sap.ui.getCore().setModel(oModel);
						var oEntry = {
							firstName : sap.ui.getCore().byId("firstName")
									.getValue(),
							lastName : sap.ui.getCore().byId("lastName")
									.getValue(),
							email : sap.ui.getCore().byId("email").getValue(),
							gender : sap.ui.getCore().byId("gender").getValue(),
							accountNumber : sap.ui.getCore().byId(
									"accountNumber").getValue(),
							firm : sap.ui.getCore().byId("firm").getValue(),
							role : sap.ui.getCore().byId("role").getValue(),
							relationship : sap.ui.getCore()
									.byId("relationship").getValue(),
							userName : sap.ui.getCore().byId("userName")
									.getValue(),
							password : sap.ui.getCore().byId("password")
									.getValue(),
							isInvited : sap.ui.getCore().byId("isInvited")
									.getValue()
						};

						oModel.setHeaders({
							"Content-Type" : "application/json",
							"dataType" : "JSON"
						});
						oModel.create("/UsersEntity", oEntry, null, function() {
							sap.ui.commons.MessageBox
									.alert("Create successful");
						}, function() {
							sap.ui.commons.MessageBox.alert("Create failed");
						});
						sap.ui.getCore().byId("users").getModel().refresh(true);
						sap.ui.getCore().byId("updPanel").getModel().refresh(
								true);

					},

					userUpdate : function() {

						var oModel = new sap.ui.model.odata.ODataModel(
								"../../../Services/userManage.xsodata",
								true);
						sap.ui.getCore().setModel(oModel);
						var oTable = sap.ui.getCore().getElementById('users');
						var i = oTable.getSelectedIndex();
						var ServiceURL = "../../../Services/userManage.xsodata";
						if (i == -1) {
							alert("Please Select a row to Update");
							return;
						} else if (i >= 0) {

							var selectedRow = oTable.getRows()[i];
						
							var selectedUser = selectedRow.getCells()[4]
									.getValue();
						
							OData
									.read(
											ServiceURL + "/UsersEntity('"
													+ selectedUser + "')",
											function(response) {
												var oFirstDialog = new sap.ui.commons.Dialog(
														{
															modal : true
														});
												oFirstDialog
														.setTitle("User Update Form");
												var oLayout = new sap.ui.commons.layout.MatrixLayout(
														{
															columns : 2,
															width : "100%"
														});
												var oTF = new sap.ui.commons.TextField(
														"tfirstName",
														{
															tooltip : 'First Name',
															value : response.firstName,
															editable : true,
															width : '200px',
															required : true
														});
												var oLabel = new sap.ui.commons.Label(
														"lfirstName",
														{
															text : 'First Name',
															labelFor : oTF
														});
												// Create the first row
												oLayout.createRow(oLabel, oTF);

												oTF = new sap.ui.commons.TextField(
														"tlastName",
														{
															tooltip : 'Last Name',
															editable : true,
															required : true,
															width : '200px',
															value : response.lastName
														});
												oLabel = new sap.ui.commons.Label(
														"llastName", {
															text : 'Last Name',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);

												oTF = new sap.ui.commons.TextField(
														"tgender",
														{
															tooltip : 'Gender',
															editable : true,
															required : true,
															width : '200px',
															value : response.gender
														});
												oLabel = new sap.ui.commons.Label(
														"lgender", {
															text : 'Gender',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);

												oTF = new sap.ui.commons.TextField(
														"temail",
														{
															tooltip : 'Email',
															editable : true,
															required : true,
															width : '200px',
															value : response.email
														});
												oLabel = new sap.ui.commons.Label(
														"lemail", {
															text : 'Email',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);

												oTF = new sap.ui.commons.TextField(
														"taccountNumber",
														{
															tooltip : 'Account Number',
															editable : true,
															required : true,
															width : '200px',
															value : response.accountNumber
														});
												oLabel = new sap.ui.commons.Label(
														"laccountNumber",
														{
															text : 'Account Number',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);

												oTF = new sap.ui.commons.TextField(
														"tfirm",
														{
															tooltip : 'Firm',
															editable : true,
															required : true,
															width : '200px',
															value : response.firm
														});
												oLabel = new sap.ui.commons.Label(
														"lfirm", {
															text : 'Firm',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);
												oTF = new sap.ui.commons.TextField(
														"trole",
														{
															tooltip : 'Role',
															editable : true,
															required : true,
															width : '200px',
															value : response.role
														});
												oLabel = new sap.ui.commons.Label(
														"lrole", {
															text : 'Role',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);

												oTF = new sap.ui.commons.TextField(
														"trelationship",
														{
															tooltip : 'Relationship',
															editable : true,
															required : true,
															width : '200px',
															value : response.relationship
														});
												oLabel = new sap.ui.commons.Label(
														"lrelationship",
														{
															text : 'Relationship',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);
												oTF = new sap.ui.commons.TextField(
														"tuserName",
														{
															tooltip : 'User Name',
															editable : true,
															required : true,
															width : '200px',
															value : response.userName
														});
												oLabel = new sap.ui.commons.Label(
														"luserName", {
															text : 'User Name',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);
												oTF = new sap.ui.commons.TextField(
														"tpassword",
														{
															tooltip : 'Password',
															editable : true,
															required : true,
															width : '200px',
															value : response.password
														});
												oLabel = new sap.ui.commons.Label(
														"lpassword", {
															text : 'Password',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);
												oTF = new sap.ui.commons.TextField(
														"tisInvited",
														{
															tooltip : 'Already Invited',
															editable : true,
															required : true,
															width : '200px',
															value : response.isInvited
														});
												oLabel = new sap.ui.commons.Label(
														"lisInvited",
														{
															text : 'Already Invited',
															labelFor : oTF
														});
												oLayout.createRow(oLabel, oTF);
							
												oFirstDialog
														.addContent(oLayout);
									
												oFirstDialog
														.addButton(new sap.ui.commons.Button(
																{
																	text : "Update",
																	press : function() {
																		var oEntry = {
																			firstName : sap.ui
																					.getCore()
																					.getControl(
																							"tfirstName")
																					.getValue(),
																			lastName : sap.ui
																					.getCore()
																					.getControl(
																							"tlastName")
																					.getValue(),
																			email : sap.ui
																					.getCore()
																					.getControl(
																							"temail")
																					.getValue(),
																			gender : sap.ui
																					.getCore()
																					.getControl(
																							"tgender")
																					.getValue(),
																			accountNumber : sap.ui
																					.getCore()
																					.getControl(
																							"taccountNumber")
																					.getValue(),
																			firm : sap.ui
																					.getCore()
																					.getControl(
																							"tfirm")
																					.getValue(),
																			role : sap.ui
																					.getCore()
																					.getControl(
																							"trole")
																					.getValue(),
																			relationship : sap.ui
																					.getCore()
																					.getControl(
																							"trelationship")
																					.getValue(),
																			userName : sap.ui
																					.getCore()
																					.getControl(
																							"tuserName")
																					.getValue(),
																			password : sap.ui
																					.getCore()
																					.getControl(
																							"tpassword")
																					.getValue(),
																			isInvited : sap.ui
																					.getCore()
																					.getControl(
																							"tisInvited")
																					.getValue()
																		};
																		var selectedUser = sap.ui
																				.getCore()
																				.getControl(
																						"tuserName")
																				.getValue();
																		var oParams = {};
																		oParams.fnSuccess = function() {
																			alert("Update successful");
																		};
																		oParams.fnError = function() {
																			alert("Update failed");
																		};
																		oParams.bMerge = true;
																		oModel
																				.setHeaders({
																					"content-type" : "application/json;charset=utf-8"
																				});
																		oModel
																				.update(
																						"/UsersEntity('"
																								+ selectedUser
																								+ "')",
																						oEntry,
																						oParams);
																		oFirstDialog
																				.close();

																	}
																}));
												oFirstDialog.open();
											});

						}
						sap.ui.getCore().byId("users").getModel().refresh(true);
					},

					userDelete : function() {
						var oModel = new sap.ui.model.odata.ODataModel(
								"../../../Services/userManage.xsodata", true);
						sap.ui.getCore().setModel(oModel);

						var oTable = sap.ui.getCore().getElementById('users');
						var i = oTable.getSelectedIndex();
						var ServiceURL = "../../../Services/userManage.xsodata";
						if (i == -1) {
							alert("Please Select a row to Update");
							return;
						} else if (i >= 0) {

							var selectedRow = oTable.getRows()[i];
							var selectedUser = selectedRow.getCells()[4]
									.getValue();
							oModel
									.setHeaders({
										"content-type" : "application/json;charset=utf-8"
									});
							oModel.remove("/UsersEntity('" + selectedUser
									+ "')", null, function() {
								alert("Delete successful");
								oModel.refresh(true);
							}, function() {
								alert("Delete failed");
							});
							oModel.refresh(true);
							sap.ui.getCore().byId("users").getModel().refresh(
									true);

						}
					}

				// onExit: function() {
				//
				// }
				});