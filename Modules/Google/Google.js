var fs = require('fs');  

//JQuery like DOM parser
$ = require('cheerio');

// get the constants
var constants = require(__dirname + "/../../constants.js");

// get the base model
var baseModel = require(constants.BASE_MODULE);

var Entities = require('html-entities').XmlEntities;
entities = new Entities();
const execSync = require('child_process').execSync;

/*
* Gooogle request, sync execution so the program waits for it's finishing
*/

function Search(ModuleParams){

	var searchText      = ModuleParams["text"];

	//var request = require('request');
	var striptags = require('striptags');
	var searchText = searchText.replace(" ","+")
	var searchText = searchText.replace(/ /g ,"+")


	execSync('curl -sA "Chrome" -L "http://www.google.com/search'
	        +'?hl='+constants.GOOGLE_LANG       //  Search language
	        +'&oe=utf8'                         //  Output encoding
	        +'&q='+searchText                   //  Query string
	        +'" -o '+constants.GOOGLE_TEMP      //  Save output to file
			,{stdio:"ignore"} );                //  Ignore response  

	/*
	* Reading the file
	*/
	fs. readFile(constants.GOOGLE_TEMP, 'utf8', function(err, body) {

	    // result variable init
		var found = 0;
		
		if (!found && $('._m3b',body).length>0){

			found = $('._m3b',body).html()
	    	}			
			//how many 2
			if (!found ){
				//how many
				var items = $('._m3b',body).get().length; // find how many lines there are in answer table
		
				if (items) {
					console.log( items + " how many 2 answer found");
					found = $('._eGc',body).html() + ", ";


					for (var count = 0; count < items; count++) {	
						found = found + $('._m3b',body).eq(count).html() + ", ";
					}
				}
            }

                        			//name list
			if (!found && $('#_vBb',body).length>0){

				found = $('#_vBb',body).html();
				console.log("Found name list");
			}

			//facts 1
			if (!found && $('._tXc>span',body).length>0){

				found = $('._tXc>span',body).html();
				console.log("Found facts 1");
			}

			//facts 2
			if (!found && $('._sPg',body).length>0){

				found = " "+$('._sPg',body).html();
				console.log("Found facts 2");			
			}
		
			//instant + description 1
			if (!found && $('._Oqb',body).length>0){

				found = $('._Oqb',body).html();
				console.log("Found instant and desc 1");

			//how many 1
				if ( $('._Mqb',body).length>0){

					found+= " "+$('._Mqb',body).html();
					console.log("Found Found instant and desc 1 - how many");
				}
			}
			//instant + description 2
			if (!found && $('._o0d',body).length>0){
                
                console.log("Found Found instant and desc 2")
				var tablehtml = $('._o0d',body).html()
                
                found = tablehtml // fallback in case a table isn't found
                
                xray(tablehtml, ['table@html'])(function (conversionError, tableHtmlList) {
                if (conversionError) {
                  console.log("Xray conversionError");
                }
                if (tableHtmlList){
                  // xray returns the html inside each table tag, and tabletojson
                  // expects a valid html table, so we need to re-wrap the table.
                  var table1 = tabletojson.convert('<table>' + tableHtmlList[0]+ '</table>');
                   console.log(table1)
                    
                   var csv = json2csv({data: table1, hasCSVColumnTitle: false })
                   
                   csv = csv.replace(/(['"])/g, "") //get rid of double quotes
                       csv = csv.replace(/\,(.*?)\:/g, ", ") //get rid column names
                       csv = csv.replace(/\{(.*?)\:/g, ", ") //get rid column names
                       csv = csv.replace(/([}])/g, " IVONAPAUSE ") //get rid of } and add a pause which will be replaced with SSML later
                               
                    found = csv.toString();
                    
                }
 
                
              });
			}

			//Time, Date
			if (!found && $('._rkc._Peb',body).length>0){

				found = $('._rkc._Peb',body).html();
				console.log("Found date and Time");
								
			}
			//Maths	
			if (!found && $('.nobr>.r',body).length>0){
				found = $('.nobr>.r',body).html();
				console.log("Found maths");					
			}

			//simple answer
			if (!found && $('.obcontainer',body).length>0){
				found = $('.obcontainer',body).html();
				console.log("Found Simple answer");
								
			}

			//Definition
			if (!found && $('.r>div>span',body).first().length>0){
				found = $('.r>div>span',body).first().html() +" definition. ";
				console.log("Found definition");
				//how many
				var items = $('.g>div>table>tr>td>ol>li',body).get().length; // find how many lines there are in answer table
				
				if (items) {
					console.log( items + " Type 4 answer sections result");

					for (var count = 0; count < items; count++) {	

						found = found + $('.g>div>table>tr>td>ol>li',body).eq(count).html() + ", ";
					}
				}
			}
			//TV show
			if (!found && $('._B5d',body).length>0){	
				found = $('._B5d',body).html();
				console.log("Found tv show");
				//how many
				if ( $('._Pxg',body).length>0){
					found+= ". "+$('._Pxg',body).html();
				}
				//how many
				if ( $('._tXc',body).length>0){

					found+= ". "+$('._tXc',body).html();
				}
			}
		
			//Weather
			if (!found && $('.g>.e>h3',body).length>0){
			
				found = $('.g>.e>h3',body).html();
				console.log("Found weather");

				//how many
				if ( $('.wob_t',body).first().length>0){

					found+= " "+ $('.wob_t',body).first().html();
					console.log("Found weather");
				}

				//how many
				if ( $('._Lbd',body).length>0){

					found+= " "+ $('._Lbd',body).html();
					console.log("Found how many");
				}
			}

			// strip out html tags to leave just text
			var speechOutputTemp = entities.decode(striptags(found));
			// make sure all full stops have space after them otherwise alexa says the word dot 

			speechOutputTemp = speechOutputTemp.split('.com').join(" dot com ") // deal with dot com
			speechOutputTemp = speechOutputTemp.split('.co.uk').join(" dot co dot uk ") // deal with .co.uk
      			speechOutputTemp = speechOutputTemp.split('.net').join(" dot net ") // deal with .net
      			speechOutputTemp = speechOutputTemp.split('.org').join(" dot org ") // deal with .org
      			speechOutputTemp = speechOutputTemp.split('a.m').join("am") // deal with a.m
      			speechOutputTemp = speechOutputTemp.split('p.m').join("pm") // deal with a.m
            
      			// deal with decimal places
      			speechOutputTemp = speechOutputTemp.replace(/\d[\.]{1,}/g,'\$&DECIMALPOINT')// search for decimal points following a digit and add DECIMALPOINT TEXT
      			speechOutputTemp = speechOutputTemp.replace(/.DECIMALPOINT/g,'DECIMALPOINT')// remove decimal point
                                        
            
      	    		speechOutputTemp = speechOutputTemp.split('IVONAPAUSE').join('<break time=\"500ms\"/>') // add in SSML pauses at table ends 
  
			speechOutputTemp = speechOutputTemp.split('.').join(". <break time=\"250ms\"/>") // Assume any remaining dot are concatonated sentances so turn them into full stops with a pause afterwards
			var GoogleResponse = speechOutputTemp.replace(/DECIMALPOINT/g,'.') // Put back decimal points
            

		if (GoogleResponse=="") GoogleResponse = "I am sorry, I dont have answer for that."

		//$('._tXc>span',body).length
		baseModel.LeaveQueueMsg("Speaker", "Speak", {'text':GoogleResponse})
	  
	})


}

module.exports.Search = Search;