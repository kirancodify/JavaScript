		var address_id = $.request.parameters.get("address_id");
		if (address_id === null) {
		    $.response.setContentType("text/plain");
		    $.response.addBody("Address Id is null!");
		}
		 
		var name = $.request.parameters.get("name");
		if (name === null) {
		    $.response.setContentType("text/plain");
		    $.response.addBody("Name is null!");
		}
		 
		 var output = [];
		 var recordSet;
		 var numOfRec;
		
		
		var conn = $.db.getConnection();
		conn.prepareStatement("SET SCHEMA \"SCHEMANAME\"").execute();
		
		// check if the active version of the meta data already exists (assuming only one active version exist at a point of time)
		var pstmt = conn.prepareStatement( "SELECT \"ADDRESS_ID\" FROM \"TABLENAME\" WHERE ADDRESS_ID = ? AND VALIDTO = ''" );
		pstmt.setString(1,address_id);
		var rs = pstmt.executeQuery();
		
		// if no active versions are present then insert a new record
		if (!rs.next()) {
			
			var st = conn.prepareStatement("INSERT INTO \"TABLENAME\" values(?,?,current_timestamp,'')");
			st.setString(1,address_id);
			st.setString(2,name);
			st.execute();
			conn.commit();
			
		}
		
		// if active version present, deactivate it and create a new version of the data
		else { 
				var st1 = conn.prepareStatement("update \"SCHEMANAME\".\"TABLENAME\" set validto = current_timestamp where validto = ''and address_id = ?");
				st1.setString(1,address_id);
				st1.execute();
				//conn.commit;
				
				var st2 = conn.prepareStatement("INSERT INTO \"TABLENAME\" values(?,?,current_timestamp,'')");
				st2.setString(1,address_id);
				st2.setString(2,name);
				st2.execute();
				conn.commit();
				
			
		}
		rs.close();
		pstmt.close();
		conn.close();
		$.response.ContentType="text/plain";
		$.response.setBody( "Success!" );
