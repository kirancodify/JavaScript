var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
CLIENT_ID = '1009521748687-tgnmvqup7bhjhjqaj1ig1ia9i4tdci41.apps.googleusercontent.com';
CLIENT_SECRET = '7Uh_s-shzkUCoVIsutJQCzWf';
REDIRECT_URL = 'http://cloudguest156.niksula.hut.fi:8080/oauth2callback'; // port is important
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
// generate a url that asks permissions for Google Contacts scope
var googleScopes = ['https://www.google.com/m8/feeds']; //['https://www.googleapis.com/auth/contacts'];
var gAuthUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: googleScopes // If you only need one scope you can pass it as string
});

var restClientClass = require('node-rest-client').Client; // for making REST calls to Google Contacts
var xml = require('xml');
var app = express();
var restClient = new restClientClass();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Create XML string of the contact that can used with the Google Contacts REST API. 
function mkGoogleXMLContact(contact) {
    var firstName = "";
    var lastName = "";
    if ('name' in contact) {
        if ('first' in contact.name)
            firstName = contact.name.first;
        if ('last' in contact.name)
            lastName = contact.name.last;
    }
    var stLine1 = "";
    var stLine2 = "";
    var zipCode = "";
    var city = "";
    var country = "";
    if ('address' in contact) {
        if ('line1' in contact.address)
            stLine1 = contact.address.line1;
        if ('line2' in contact.address)
            stLine2 = contact.address.line2;
        if ('zipCode' in contact.address)
            zipCode = contact.address.zipCode;
        if ('city' in contact.address)
            city = contact.address.city;
        if ('country' in contact.address)
            country = contact.address.country;
    }
    var phone = (contact.phoneNumber || "");
    var email = (contact.email || "");
    
    var xmlString = xml({
        'atom:entry':
        [
            {
                '_attr': {
                    'xmlns:atom': 'http://www.w3.org/2005/Atom',
                    'xmlns:gd': 'http://schemas.google.com/g/2005'
                }
            },
            {
                'atom:category': {
                    '_attr': {
                        'scheme': 'http://schemas.google.com/g/2005#kind',
                        'term': 'http://schemas.google.com/contact/2008#contact'
                    }
                }
            },
            {
                'gd:name': [
                    { 'gd:givenName': firstName },
                    { 'gd:familyName': lastName },
                    { 'gd:fullName': firstName + ' ' + lastName }
                ]
            },
            {
                'gd:structuredPostalAddress': [
                    {
                        '_attr': {
                            'rel': 'http://schemas.google.com/g/2005#home'
                        }
                    },
                    { 'gd:street': stLine1 + ' ' + stLine2 },
                    { 'gd:postcode': zipCode },
                    { 'gd:city': city },
                    { 'gd:country': country },
                ]
            },
            {
                'atom:content': [
                       {
                            '_attr': {
                                'type': 'text'
                            }
                        },
                    'Notes'
                ]
            },
            {
                'gd:email': {
                    '_attr': {
                        'rel': 'http://schemas.google.com/g/2005#work',
                        'primary': 'true',
                        'address': email,
                        'displayName': firstName + ' ' + lastName
                    }
                }
            },
            {
                'gd:phoneNumber': phone
            },
    ]
    }, true);
    return xmlString;
}

// Split a full name (string) into first and last name (returned as object).
function splitFullName(fullName) {
  var parts = fullName.split(' ');
  // assume that the last component is the last name and everything before that 
  // belongs to the first name 
  return {
    first: parts.slice(0, parts.length - 1).join(' '),
    last:  parts[parts.length - 1]
  };
}

// Return an object that represents Mongoose find conditions for a name.
function mkFindNameCondition(name) {
  // argument name is a string that may contain space-separated components or 
  // just one name.
  var parts = name.split(' ');
  if (parts.length === 1) {
    // only one name -> search both first and last name (either one may match)
    return {
      $or: [ { 'name.first': new RegExp(name, 'i') }, // i = ignore case
             { 'name.last':  new RegExp(name, 'i') } ]
    }
  }
  parts = splitFullName(name);
  // name contains more than one part -> assume it is a search for first AND last name
  // -> both name parts must match
  return {
    'name.first': new RegExp(parts.first, 'i'),
    'name.last': new RegExp(parts.last, 'i')
  }
}

function mkFindCondsFields(query) {
  /* Return a Javascript object with keys "conditions" and "fields" based on query. 
  Key "errors" contains a list of field names that do not exist in the 
  database model, if the query contains any such keys. 
  Conditions object can be used as the conditions argument 
  to Mongoose Model.find. Fields is a string of field names that should be 
  included in the results of Model.find. 
  Argument query is an object that contains 
  URL query parameters (== req.query). Different query keys are ANDed together 
  in the search.
  */
  var conds = {}; // conditions
  var fields = ""; // select only these fields into the results
  var errors = []; // gather non-existent model field names, if the query contains any
  var and_ors = []; // AND name and address ORs at the end
  for (var key in query) {
    // Use RegExp for all string searches so that the search matches content 
    // that contains the key word instead of requiring exact match.
    // Nested fields can use dots in the query (URL ?name.first=Matt).
    // If the query contains the outer level of a nested field alone (?name=Matt),
    // search for all the inner fields.
    if (key === 'name') {
      // query '?name=john' searches one word in the whole name 
      // -> must OR first and last name.
      // ?name=Adam+Smith must match both first and last name.
      var name_cond = mkFindNameCondition(query.name);
      and_ors.push(name_cond);
      
    } else if (key === 'address') {
      // OR all address fields for query ?address=street+1
      var addr_ors = [
        { 'address.line1': new RegExp(query.address, 'i') },
        { 'address.line2': new RegExp(query.address, 'i') },
        { 'address.city': new RegExp(query.address, 'i') },
        { 'address.zipCode': new RegExp(query.address, 'i') },
        { 'address.country': new RegExp(query.address, 'i') },
      ];
      and_ors.push({ $or: addr_ors });
      
    } else if (key === 'lastModded') {
      conds.lastModded = { $gte: new Date(query.lastModded) };
      // URL query uses time format "yyyy-mm-dd", "yyyy-mm-ddThh:mm"
      // URL value is interpreted as UTC 0 / GMT 0
      // find only contacts that have been modified after the given date
      
    } else if (key === 'fields') {
      // fields key word is used to select only some fields to the results
      // (which is not the same as search)
      var fieldsCommaStr = "";
      if (query.fields instanceof Array) {
        // if query is like ?fields=name&fields=email
        fieldsCommaStr = query.fields.join();
      } else {
        // URL query in the form ?fields=name,address.city,phoneNumber
        fieldsCommaStr = query.fields;
      }
      fields = fieldsCommaStr.replace(/,/g, ' '); // replace commas with spaces
      
    } else if (!Contact.schema.path(key)) {
      errors.push(key);
      // URL query keys may refer to model fields that do not exist -> search would 
      // probably return empty results when a field does not exist, so instead of 
      // searching we gather non-existent field names into an error message.
      
    } else {
      // URL queries may contain nested elements directly, 
      // such as ?name.first=Adam or ?address.city=helsinki
      // or non-nested fields like phoneNumber. 
      // Turn them into RegExp too.
      conds[key] = new RegExp(query[key], 'i');
    }
  }
  if (and_ors.length > 0) {
    conds.$and = and_ors;
    // this is needed to have multiple separate OR clauses
  }
  return { conditions: conds, fields: fields, errors: errors };
}

// Modifies contact with the values in req.body. Does not change values 
// that are not specified in req.body. Does not call contact.save()
function modifyContact(contact, req) {
  // Lots of if statements here because POST/PUT messages may add/modify only 
  // some of the fields of the contact. If a field is missing from PUT, 
  // its value must not be changed in the database. The $set operator of 
  // Mongo update method is not very convenient with nested model fields, 
  // so we modify fields one by one. Additionally, the POST/PUT body may be in 
  // either URL-encoded or JSON format.
  if ('name' in req.body) { // JSON body
    if ('first' in req.body.name)
      contact.name.first = req.body.name.first;
    if ('last' in req.body.name)
      contact.name.last = req.body.name.last;
  }
  
  if ('phoneNumber' in req.body) {
    contact.phoneNumber = req.body.phoneNumber;
  }

  if ('address' in req.body) { // JSON body
    if ('line1' in req.body.address)
      contact.address.line1 = req.body.address.line1;
    if ('line2' in req.body.address)
      contact.address.line2 = req.body.address.line2;
    if ('city' in req.body.address)
      contact.address.city = req.body.address.city;
    if ('zipCode' in req.body.address)
      contact.address.zipCode = req.body.address.zipCode;
    if ('country' in req.body.address)
      contact.address.country = req.body.address.country;
  }

  if ('email' in req.body) {
    contact.email = req.body.email;
  }

  if ('firstName' in req.body) { // URL-encoded body
    contact.name.first = req.body.firstName;
  }
  if ('lastName' in req.body) {
    contact.name.last = req.body.lastName;
  }
  if ('stAddress1' in req.body) {
    contact.address.line1 = req.body.stAddress1;
  }
  if ('stAddress2' in req.body) {
    contact.address.line2 = req.body.stAddress2;
  }
  if ('city' in req.body) {
    contact.address.city = req.body.city;
  }
  if ('zipCode' in req.body) {
    contact.address.zipCode = req.body.zipCode;
  }
  if ('country' in req.body) {
    contact.address.country = req.body.country;
  }
}


// database schema
var contactSchema = mongoose.Schema({
  name: {
    first: String,
    last: String
  },
  phoneNumber: String,
  address: {
    line1: String, // street address
    line2: String,
    city: String,
    zipCode: String,
    country: String
  },
  email: String,
  lastModded: { type: Date, default: Date.now }, // last modification time
  // _id primary key is added automatically
});

contactSchema.virtual('name.full').get(function() {
  return this.name.first + ' ' + this.name.last;
});
contactSchema.virtual('name.full').set(function(name) {
  var parts = splitFullName(name);
  this.name.first = parts.first;
  this.name.last = parts.last;
});
contactSchema.virtual('address.full').get(function() {
  return this.address.line1 + '\n' + 
         this.address.line2 + '\n' + 
         this.address.zipCode + ' ' + this.address.city + '\n' + 
         this.address.country;
});

var Contact = mongoose.model('Contact', contactSchema);

mongoose.connect('mongodb://localhost/contacts');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  app.use('/', express.static(__dirname + '/www')); // serve static web content for phase 2

  // =============== insert test data ================
  var c1 = new Contact({ 
    name: { first: "John", last: "Doe" },
    phoneNumber: "04012345",
    address: { city: "Helsinki" },
  });
  c1.save(function(err, c) {
    if (err) return console.error(err);
  });
  var c2 = new Contact({
    name: { first: "Mary", last: "Pol" },
    phoneNumber: "05098765",
  });
  c2.save(function(err, c) {
    if (err) return console.error(err);
  });
  // =================================================
  
  app.get('/oauth2', function(req, res) {
    res.redirect(gAuthUrl); // redirect to Google auth
  });
  
  // Google redirects back to this address from the Google login
  app.get('/oauth2callback', function(req, res) {
    oauth2Client.getToken(req.query.code, function(err, tokens) {
      console.log('oauth2callback: errors ', err); // debug print
      console.log('oauth2callback: tokens ', tokens);
      if (!err) {
        oauth2Client.setCredentials(tokens);
        //console.log(oauth2Client.credentials.access_token);
        // the token as string that is sent to with Google REST calls
      }
      res.redirect('/'); // main web page
    });
  });
  
  // REST API URLs below

  app.get('/contacts', function(req, res) {
    // get all contacts
    var conds = mkFindCondsFields(req.query);
    if (conds.errors.length > 0){
       return res.status(404).send("Search for non-existent fields: " + conds.errors.join());
      }
    // if URL contains query parameters, they will filter the results
    Contact.find(conds.conditions, conds.fields, function(err, contacts) {
      if (err) {
        return res.status(404).send(err);
      }
      res.send(contacts); // in JSON
    });
  });

  app.get('/contacts/:id', function(req, res) {
    // get one contact
    var conds = mkFindCondsFields(req.query);
    // possible to select only some fields of the contact
    Contact.findById(req.params.id, conds.fields, function(err, contact) {
      if (err || !contact) {
        return res.status(404).send("Contact not found");
      }
      res.send(contact);
    });
  });

  app.post('/contacts', function(req, res) {
    // add one new contact
    // the request body can be in either JSON or URL-encoded format
    var contact = new Contact(); // lastModded gets default the value automatically
    modifyContact(contact, req);
    
    contact.save(function(err) {
      if (err)
        return res.status(404).send(err);
      res.location('/contacts/' + contact.id);
      // best practices: response location header points to the created resource
      res.status(201).type('html').send();
      
      // create the new contact in Google Contacts too
      // (for the authenticated Google user)
      /*
      restClient.post('https://www.google.com/m8/feeds/contacts/default/full', {
        'GData-Version': '3.0',
        'Authorization': 'Bearer ' + oauth2Client.credentials.access_token, // can be undefined
        'Content-Type': 'application/atom+xml',
        'data': mkGoogleXMLContact(contact)
      }, function(data, res) {
        console.log(res); // debug
      });
      */
    });
  });
  
  // NOTE: check that arguments are valid at front end before sending PUT and POST 
  // (e.g. email looks like a valid email address)
  
  app.put('/contacts/:id', function(req, res) {
    // modify an existing contact
    Contact.findById(req.params.id, function(err, contact) {
      if (err || !contact) {
        return res.status(404).send("Contact not found");
      }
      
      modifyContact(contact, req);
      
      contact.lastModded = Date.now();
      contact.markModified('lastModded');
      
      contact.save(function(err, contact) {
        if (err)
          return res.status(404).send(err);
        res.status(204).type('text/html').end(); // success, 204 No Content in response
      });
    });
  });
  
  app.delete('/contacts', function(req, res) {
    // delete all contacts
    Contact.remove({}, function(err) {
      if (err)
        return res.status(404).send(err);
      res.status(204).type('text/html').end();
    });
  });
  
  app.delete('/contacts/:id', function(req, res) {
    // delete one contact
    Contact.findByIdAndRemove(req.params.id, function(err, contact) {
      if (err || !contact) 
        return res.status(404).send("Contact not found");
      res.status(204).type('text/html').end(); // no content
    });
  });
  
  var port = process.env.PORT || 8080;
  console.log("Starting to listen on port " + port);
  app.listen(port);
});


