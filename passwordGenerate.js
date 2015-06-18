passwordGenerate: function() 
            {
            	var randomstring = "";
                var password = [];
                var charCode = String.fromCharCode;
                var R = Math.random;
                var random, i;
                password.push(charCode(48 + (0 | R() * 10)));
                password.push(charCode(65 + (0 | R() * 26)));
                for (i = 2; i < 10; i++) 
                {
                    random = 0 | R() * 62;
                    password.push(charCode(48 + random + (random > 9 ? 7 : 0) + (random > 35 ? 6 : 0)));
                }
                randomstring = password.sort(function() {return R() - .5;}).join('');
                sap.ui.getCore().getControl("tpassword").setValue(randomstring);
                sap.ui.getCore().getControl("tpassword").setEditable(false);
            }
