'use strict';

 /**
  * @author = Rohit Goyal
  * 
  * This sample Lambda function is created during GovHack2017. 
  * 
  * It's the backend for Amazon Lex to fulfill Waste Collection Booking. 
  *
  * What is does?
  * -------------
  * 1. Takes Request from Amazon Lex in form of JSON
  * 2. Does basic validations
  * 3. Based on the incoming address, it calls Google Geoencoding API to return Lat and Lng
  * 4. Insert the Booking in DynamoDb
  * 5. Reply back to Amazon Lex with Reference Number
  *
  */


 // --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------

var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}

//bookCollection function that accepts incoming intent from Amazon Lex
function bookCollection(intentRequest, callback) {
    // Create a Unique 9 digit application id
    var appId = Math.floor(100000000 + Math.random() * 900000000);


    //Find Lat and Lag for a location using Google Geocoding API
    var request = require('request');
    
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+intentRequest.currentIntent.slots.address+ " " +intentRequest.currentIntent.slots.suburb+"&key=AIzaSyAEygzKZnFlSNxjamtGBGI9roGXnfiDKGY";
    request(url, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
      var response = JSON.parse(body);
    
    for(var i = 0; i < response.results.length; i++) {
        var obj = response.results[i];
        console.log(obj);
    }

    var params = {
        TableName: "booking",
        Item: {
            applicationId: appId,
            name: intentRequest.currentIntent.slots.name,
            emailAddress: intentRequest.currentIntent.slots.email,
            suburb: intentRequest.currentIntent.slots.suburb,
            streetAddress: intentRequest.currentIntent.slots.address,
            items: intentRequest.currentIntent.slots.items,
            collectionDate: intentRequest.currentIntent.slots.collectionDate,
            formatted_address: response.results[0].formatted_address,
            lat: response.results[0].geometry.location.lat,
            lan: response.results[0].geometry.location.lng
        }
    };
    
    //Insert into DynamoDb
    //http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    docClient.put(params, function(err, data) {
        if (err) {
            console.log("ERROR: " + err);
            //context.fail(err);
        }
        else {
            console.log("SUCCESS: " + JSON.stringify(data));
            //context.succeed(data);
        }
    });
    console.log("docClient.put() done");
    
    var content = "Thanks, your request has been accepted. Please note your application Id "+appId;
    // Order the flowers, and rely on the goodbye message of the bot to define the message to the end user.  In a real bot, this would likely involve a call to a backend service.
    callback(close(intentRequest.sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: content }));
    });
}

 // --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    const intentName = intentRequest.currentIntent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'BookCollection') {
        return bookCollection(intentRequest, callback);
    }
    throw new Error(`Intent with name ${intentName} not supported`);
}

// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    console.log("Received event from Lex: ", JSON.stringify(event));
    try {
        // By default, treat the user request as coming from the America/New_York time zone.
        process.env.TZ = 'America/New_York';
        console.log(`event.bot.name=${event.bot.name}`);

        
        if (event.bot.name !== 'BookCollection') {
             callback('Invalid Bot Name');
        }
        
        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};
