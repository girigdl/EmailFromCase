//call this funciton onload of the email
function EmailFromCase() {
var CREATEDON=1;
var formType=Xrm.Page.ui.getFormType();
if(formType==CREATEDON){
	RegardingOnchange();
	}
}

//call this funciton onchange of regarding filed
function RegardingOnchange(){
	roi = Xrm.Page.getAttribute("regardingobjectid").getValue()
	if(roi != null){
		var regarding=Xrm.Page.getAttribute("regardingobjectid").getValue()[0].entityType;
		var id=Xrm.Page.getAttribute("regardingobjectid").getValue()[0].id;
		var guid = id.replace(/{/g, "").replace(/}/g, "");
		if( regarding!=null && guid!=null) {
				if(regarding=="incident") {
					var caseData=getCaseDetails(regarding,guid);
					var subj=caseData[0]+" - "+caseData[1];
					Xrm.Page.data.entity.attributes.get("subject").setValue(subj);
				}
		}
	} else {
		Xrm.Page.ui.setFormNotification("Could get object ID of regardingobjectid", "INFORMATION");
	}
}


function getCaseDetails(entityName,recordId) {
	Xrm.Page.ui.setFormNotification("Getting case details", "INFORMATION");
	var reqXML="";
		reqXML+="";
		reqXML+="<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
		reqXML+="  <s:Body>";
		reqXML+="    <Retrieve xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
		reqXML+="      <entityName>"+entityName+"</entityName>";
		reqXML+="      <id>"+recordId+"</id>";
		reqXML+="      <columnSet xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">";
		reqXML+="        <a:AllColumns>false</a:AllColumns>";
		reqXML+="        <a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">";
		reqXML+="          <b:string>title</b:string>";
		reqXML+="          <b:string>ticketnumber</b:string>";
		reqXML+="        </a:Columns>";
		reqXML+="      </columnSet>";
		reqXML+="    </Retrieve>";
		reqXML+="  </s:Body>";
		reqXML+="</s:Envelope>";

    var req = new XMLHttpRequest();
    req.open("POST", "https://YOUR CRM URL HERE/XRMServices/2011/Organization.svc/web", false);
    req.setRequestHeader("Accept", "application/xml, text/xml, */*");
    req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Retrieve");
    req.send(reqXML);
	
	if (req.status == 200) {
		var merge = req.responseXML;
		if (merge != null) {
			var mergeAttributes = null;
			if (window.navigator.appName == "Microsoft Internet Explorer" || window.navigator.appName == "Netscape") {
				if (navigator.appVersion.indexOf("Chrome") == -1)
					mergeAttributes = merge.getElementsByTagName("a:KeyValuePairOfstringanyType");
				else
					mergeAttributes = merge.getElementsByTagName("KeyValuePairOfstringanyType");
			}
			else if (navigator.appVersion.indexOf("Chrome") != -1) {
				mergeAttributes = merge.getElementsByTagName("KeyValuePairOfstringanyType");
			}
			for (i = 0; i < mergeAttributes.length; i++) {
				var attr = mergeAttributes[i];
				var key = attr.childNodes[0];
				if (key != null && key.childNodes[0].nodeValue == "title") {
					var caseTitle = attr.childNodes[1].childNodes[0].nodeValue;
				}
				if (key != null && key.childNodes[0].nodeValue == "ticketnumber") {
					var ticketNum = attr.childNodes[1].childNodes[0].nodeValue;

				}
			}
			return [caseTitle,ticketNum];
		}
	} else {
		Xrm.Page.ui.setFormNotification("request status " + req.status , "INFORMATION");
	}
}