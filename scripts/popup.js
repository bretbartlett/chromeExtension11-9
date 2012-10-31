// Copyright (c) 2012 Kitchology. All rights reserved.

// Show correct menu depending on whether the user is logged in.

var storage = chrome.storage.local; //Uses Chrome local storage
var userLoggedIn = null;  //Variable to store the logged in user name

var makeSignedRequest = function(ck,cks,encodedurl) {     
 
	var accessor = { consumerSecret: cks, tokenSecret: ""};          
	var message = { action: encodedurl, method: "GET", parameters: [["oauth_version","1.0"],["oauth_consumer_key",ck]]};
 
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);
 
	var parameterMap = OAuth.getParameterMap(message);
	var baseStr = OAuth.decodeForm(OAuth.SignatureMethod.getBaseString(message));           
	var theSig = "";
 
	if (parameterMap.parameters) {
		for (var item in parameterMap.parameters) {
			for (var subitem in parameterMap.parameters[item]) {
				if (parameterMap.parameters[item][subitem] == "oauth_signature") {
					theSig = parameterMap.parameters[item][1];                    
					break;                      
				}
			}
		}
	}
 
	var paramList = baseStr[2][0].split("&");
	paramList.push("oauth_signature="+ encodeURIComponent(theSig));
	paramList.sort(function(a,b) {
		if (a[0] < b[0]) return -1;
		if (a[0] > b[0]) return 1;
		if (a[1] < b[1]) return  -1;
		if (a[1] > b[1]) return 1;
		return 0;
	});
 
	var locString = "";
	for (var x in paramList) {
		locString += paramList[x] + "&";                
	}
 
	var finalStr = baseStr[1][0] + "?" + locString.slice(0,locString.length - 1);
 
	return finalStr;
	
	};

$(document).ready(
  function() {
    //$('p').text('jQuery Successfully loaded.');
    
    $('div#logindialog').dialog( { //Hide login dialog unless user is not logged in
      autoOpen: false
    });
    
    $('div#savedialog').dialog( { //Hide save dialog unless user selects save
      autoOpen: false
    });
    
    $('div#settingsdialog').dialog( { //Hide settings dialog unless user selects settings
      autoOpen: false
    });
    
    /*  Checks to see if a user is stored in the Chrome storage.  If so, then it shows the logged in menu.  If not, then it shows the login dialog box. */
    storage.get('user', function(items) {
      if(!items.user) {    
        $('div#logindialog').dialog('open');
        
      }      
      else {
        showLoggedInMenu();
      }       
    
    });    
    
    /*  Function to show the menu */            
    function showLoggedInMenu() {
      $('div#loggedinmenu').css('display','inline');
      $('#menu').menu();
    }  


    
    /* Function to bring user to Kitchology.com   */
    $('#menugotoKitch').click(
    	function(){
 		chrome.tabs.create({ 'url' : 'kitchology.html'});
    });
    
    
    /*  Upon selection of "Login" button, this function confirms that correct name and password have been entered and logs in the user. */
    $('#userlogin').click(
      function() {  
            //stores the input into these variables
        userLoggedIn = $('input[name="userName"]').val();
        var userPassword = $('input[name="password"]').val();
        
		var signedURL = makeSignedRequest("dj0yJmk9bGtUYVl1ZEdHYUlsJmQ9WVdrOWJUWjRjbGh0TXpBbWNHbzlPRFF4TURjNE5qWXkmcz1jb25zdW1lcnNlY3JldCZ4PTEw",
											"1d6ebddef0091378da65dc0230b1de806032f0ca",
											"https://web.kitchology.com/api/v1/users/login");
		
			$.post("https://web.kitchology.com/api/v1/users/login", {username : userLoggedIn, password : userPassword},
 				function(data){
   					alert(data);
 				}, "json");

/*
         	 storage.set({'user':userLoggedIn}, function() {      
            	$('div#logindialog').dialog('close');              
            	showLoggedInMenu();
          		return true;
          		});
*/
        
      });
    
    /*  Function to save recipe when the Save Recipe menu item is selected */
    $('#menusaverecipes').click(
      function() {
      
        $('div#loggedinmenu').css('display','none');
        $('div#savedialog').dialog('open');              
      }
    );    
    
       /* Function to bring back to the main menu after saving recipe  */
    $('#saverecipe').click(
      function() {
        //function to see if checkbox is checked      
        	if($('#sharerecipe').prop("checked")){
      			//alert("recipe shared");
      		}
      		
      	$.post("test.json", { recipe : "5" } );
      	
      		
        $('div#savedialog').dialog('close');
        showLoggedInMenu();
      }
    );
    
    
        /* Function to bring back to main menu after canceling saving recipe */
     $('#cancel').click(
      function() {
        $('div#savedialog').dialog('close');
        showLoggedInMenu();
      }
    );   
    
    
    /*  Function to show settings when the Settings menu item is selected */
    $('#menusettings').click(
      function() {
        $('div#loggedinmenu').css('display','none');
        $('div#settingsdialog').dialog('open');              
      }
    ); 
    
    
         /* Function for when settings are saved (right now just back to menu) */
     $('#savesettings').click(
      function() {
      //function to see if checkbox is checked      
        if($('#setting1').prop("checked")){
      		//alert("settings saved");
      		}
        $('div#settingsdialog').dialog('close');
        showLoggedInMenu();
      }
    );   
       
    
    /* Function to bring back to main menu after canceling settings */
     $('#cancel2').click(
      function() {
        $('div#settingsdialog').dialog('close');
        showLoggedInMenu();
      }
    );   
    
    
    /*  Function to show recipes of the user when the Show Recipes menu item is selected */    
    $('#menushowrecipes').click(
      function() {        
        $('div#loggedinmenu').css('display','none'); //Hide the menu
        $('#recipes').dataTable( {
        
         "bProcessing": true,
         "bDestroy": true,
         "bRetrieve":true,
   		 "sAjaxSource": "https://web.kitchology.com/api/v1/users/recipes",
   //      "sAjaxSource": 'https://web.kitchology.com/KitchologyREST/resources/com.kitchology.jpa.userrecipes'   
         
         "aoColumns": [
            { "sTitle": "Name" },
            { "sTitle": "Description" },
            { "sTitle": "URL" }
        ]
        });
        $('div#recipetable').css('display','inline');
      }
    );
    
    	/* Function to bring back to main menu from recipe table */
     $('#tablecancel').click(
      function() {
        $('div#recipetable').css('display','none');
       // $('div#recipes').css('display','none');
        $('div#loggedinmenu').css('display','inline');
      
      }
    );   
    
    /*  Function to logout the user when the Logout menu item is selected */
    $('#menulogout').click(  
      function() {
        storage.clear();
        userLoggedIn = null;
        $('div#loggedinmenu').css('display','none');
        $('div#logindialog').dialog('open');             
      }
    );
});
