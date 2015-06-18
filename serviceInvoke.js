 function Service_PreInvokeMethod(MethodName, Inputs, Outputs) { 
     if (MethodName == "Import")  { 
         var ContactId, Type, Area, SubArea, Account, DealerName, Descreption, FinaAct, Source, Status, VIN, AssetId, Accessible, Knowledgeable, Timely, Resolved, Overall, Comments; 
         var fpName: File = Clib.fopen("FileUploadForReports.txt", "rt"); 
         var sFileData = "";
         var sCount = 0; 
         if (fpName == null)  { 
             TheApplication().RaiseErrorText("Error opening file for reading.Check if the file is present in Bin folder") 
         } 
         else  {  
             while (null != (sFileData = Clib.fgets(fpName)))   {  
                 var cmdArrayOrg = sFileData.split("|");   
                 ContactId = cmdArrayOrg[0];   
                 Type = cmdArrayOrg[1];   
                 Area = cmdArrayOrg[2];   
                 SubArea = cmdArrayOrg[3];   
                 Account = cmdArrayOrg[4];   
                 DealerName = cmdArrayOrg[5];   
                 Descreption = cmdArrayOrg[6];   
                 FinaAct = cmdArrayOrg[7];   
                 Source = cmdArrayOrg[8];   
                 Status = cmdArrayOrg[9];   
                 VIN = cmdArrayOrg[10];  
                 AssetId = cmdArrayOrg[11];  
                 Accessible = cmdArrayOrg[12];  
                 Knowledgeable = cmdArrayOrg[13];  
                 Timely = cmdArrayOrg[14];  
                 Resolved = cmdArrayOrg[15];  
                 Overall = cmdArrayOrg[16];  
                 Comments = cmdArrayOrg[17];    //TheApplication().RaiseErrorText( VIN);            
                 var sSRBO = TheApplication().GetBusObject("Service Request");   
                 var sSRBC =  sSRBO.GetBusComp("Service Request"); 
                 var sCSBC =  sSRBO.GetBusComp("Customer Survey");   
                
                 with(sSRBC)    {    
                         ClearToQuery();    
                         SetViewMode(3);    
                         ExecuteQuery();    
                         NewRecord(NewBefore);    
                         SetFieldValue("Contact Id", ContactId);    
                         SetFieldValue("INS Product", Type);    
                         SetFieldValue("INS Area", Area);    
                         SetFieldValue("INS Sub-Area", SubArea);    
                         SetFieldValue("Account", Account);    
                         SetFieldValue("Selected SR Routing Dealer", DealerName);    
                         SetFieldValue("Description", Descreption);    
                         SetFieldValue("CF Financial Account", FinaAct);    
                         SetFieldValue("Asset Id", AssetId);    
                         SetFieldValue("Source", Source);    
                         SetFieldValue("eAuto Vehicle Serial Num", VIN);    
                         SetFieldValue("Status", Status);    
                         WriteRecord();          
                         with(sCSBC)               {                    
                                 NewRecord(NewBefore);                     
                                 SetFieldValue("Accessible", Accessible);                     
                                 SetFieldValue("Knowledgable", Knowledgeable);                     
                                 SetFieldValue("Timely", Timely);                     
                                 SetFieldValue("Resolved", Resolved);                     
                                 SetFieldValue("Overall", Overall);                     
                                 SetFieldValue("Comments", Comments);                     
                                 WriteRecord();              
                             } //end of With Survey             
                     } //end of With    
             } //end of while     
         } //end of Else   
         Clib.fclose(fpName); 
     } 
     return (CancelOperation);
 }