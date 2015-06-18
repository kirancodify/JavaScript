function getFullName(contact) {
    var name = "";
    if ('name' in contact) {
        if ('first' in contact.name && contact.name.first.length > 0)
            name += contact.name.first + ' ';
        if ('last' in contact.name)
            name += contact.name.last;
    }
    if (name === '')
        return 'No name';
    return name;
}

// If the contact is missing fields, add empty strings to those field values. 
function fillMissingContactFields(contact) {
    if (!('name' in contact)) {
        contact.name = {first: "", last: ""};
    } else {
        if (!('first' in contact.name))
            contact.name.first = "";
        if (!('last' in contact.name))
            contact.name.last = "";
    }
    if (!('address' in contact)) {
        contact.address = {line1: "", line2: "", city: "", zipCode: "", country: ""};
    } else {
        if (!('line1' in contact.address))
            contact.address.line1 = "";
        if (!('line2' in contact.address))
            contact.address.line2 = "";
        if (!('city' in contact.address))
            contact.address.city = "";
        if (!('zipCode' in contact.address))
            contact.address.zipCode = "";
        if (!('country' in contact.address))
            contact.address.country = "";
    }
    if (!('phoneNumber' in contact))
        contact.phoneNumber = "";
    if (!('email' in contact))
        contact.email = "";
    if (!('lastModded' in contact))
        contact.lastModded = "";
    return contact;
}

// Return a JS object with the same structure as the Contact model. 
// Reads input from the add/edit HTML form. 
function mkContactObjectFromForm() {
    var c = {};
    c.name = {
        first: $('#addFirstName').val(),
        last: $('#addLastName').val(),
    };
    c.address = {
        line1: $('#addStline1').val(),
        line2: $('#addStline2').val(),
        zipCode: $('#addZipCode').val(),
        city: $('#addCity').val(),
        country: $('#addCountry').val(),
    };
    c.phoneNumber = $('#addPhone').val();
    c.email = $('#addEmail').val();
    return c;
}

/* Reset add/edit form input field values to empty or prefilled values. 
   Argument: prefillEdit: if true, prefill fields with the selected contact data. 
   Otherwise reset to empty. 
*/ 
function resetAddFormInputs(prefillEdit) {
    if (prefillEdit) {
        $('#addFirstName').val($('#firstName').text());
        $('#addLastName').val($('#lastName').text());
        $('#addStline1').val($('#stAddress1').text());
        $('#addStline2').val($('#stAddress2').text());
        $('#addZipCode').val($('#zipCode').text());
        $('#addCity').val($('#city').text());
        $('#addCountry').val($('#country').text());
        $('#addPhone').val($('#phoneNumber').text());
        $('#addEmail').val($('#email').text());
    } else {
        $('#addFirstName').val('');
        $('#addLastName').val('');
        $('#addStline1').val('');
        $('#addStline2').val('');
        $('#addZipCode').val('');
        $('#addCity').val('');
        $('#addCountry').val('');
        $('#addPhone').val('');
        $('#addEmail').val('');
    }
}

/* Update the contents of the right-side contact details box. 
   Fetches details from the REST API. Give contactID as a string. 
   If argument updateListName is true, update the corresponding contact 
   name in the contacts list as well. 
*/
function updateContactDetailsBox(contactID, updateListName) {
    $.getJSON('/contacts/' + contactID, function(contact) {
        fillMissingContactFields(contact);
        // modify the single contact details box
        $('#firstName').text(contact.name.first);
        $('#lastName').text(contact.name.last);
        $('#stAddress1').text(contact.address.line1);
        $('#stAddress2').text(contact.address.line2);
        $('#city').text(contact.address.city);
        $('#zipCode').text(contact.address.zipCode);
        $('#country').text(contact.address.country);
        $('#phoneNumber').text(contact.phoneNumber);
        $('#email').text(contact.email);
        var date = new Date(Date.parse(contact.lastModded));
        $('#lastModded').text(date.toDateString() + ', ' + date.toTimeString());
        $('#oneContactDetails').data('contactid', contact._id);
        
        if (updateListName) {
            // data attribute selector does not work with dynamically added data attributes
            //$('#contactsList').find('a[data-id=' + contactID + ']').text(getFullName(contact)); // does not work
            // use a loop instead to find the correct contact in the list
            var contacts = $('#contactsList').children();
            for (var i = 0; i < contacts.length; i++) {
                if (contacts.eq(i).data('id') === contactID) {
                    contacts.eq(i).text(getFullName(contact));
                    break;
                }
            }
        }
    });
}

// Reset all values in the right-side contact details box. 
function resetContactDetailsBox() {
    $('#firstName').text('');
    $('#lastName').text('');
    $('#stAddress1').text('');
    $('#stAddress2').text('');
    $('#city').text('');
    $('#zipCode').text('');
    $('#country').text('');
    $('#phoneNumber').text('');
    $('#email').text('');
    $('#lastModded').text('');
    $('#oneContactDetails').data('contactid', '');
}

// Return a new "a" element for the given contact to be used in the contacts list. 
function createContactsListItem(contact) {
    return $('<a>').attr('href', '#').data('id', contact._id)
             .addClass('list-group-item').text(getFullName(contact));
}

// Create "no contacts" item for the contacts list. 
// Returns the element, which is not yet appended to the DOM. 
function createNoContactsItem() {
    return $('<div>').attr('id', 'noContactsItem')
             .addClass('list-group-item').text('No contacts');
}

// Display a dismissible alert at the top of the document. 
function showErrorAlert(text) {
    $('#errorAlert').html(
      '<div class="alert alert-danger alert-dismissible" role="alert"> \
         <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button> \
         <strong>Error!</strong> ' + text + 
      '</div>');
}

// Fetch all contacts (using query) and fill the contacts list (left-side box in the web page). 
function fillContactsList(query) {
    var contactsList = $('#contactsList');
    $.getJSON('/contacts', query, function(data) {
        // fill in contacts list, only names are displayed in the list
        if (data.length > 0) {
            $.each(data, function(idx, c) {
                // add the contact ID as a hidden data-id attribute to the list element, so that 
                // contact details are easy to fetch later
                contactsList.append(createContactsListItem(c));
                //'<a href="#" class="list-group-item">' + fullName + '</a>');
            });
        } else {
            contactsList.append(createNoContactsItem());
        }
    });
}

$(document).ready(function() {
    // ensure that these buttons are disabled when no contact is selected at the start
    $('#editButton').prop('disabled', true);
    $('#deleteButton').prop('disabled', true);
    $('#searchInput').val(''); // empty the search field on page reload
    
    var contactsList = $('#contactsList');
    // fetch all contacts and display them (only names) in the page 
    fillContactsList({"fields": "name"});
    
    // open contact details when a contact (name) is clicked in the list
    contactsList.on('click', 'a.list-group-item', function(event) {
        event.preventDefault();
        // active class highlights the one selected contact
        contactsList.find('a.active').removeClass('active');
        $(event.target).addClass('active');
        
        // the ID of the clicked contact
        var cid = $(event.target).data('id');
        // fetch single contact details
        updateContactDetailsBox(cid, false);
        $('#editButton').prop('disabled', false); // activate edit button
        $('#deleteButton').prop('disabled', false);
    });
    
    $('#addButton').click(function(event) {
        // Add new contact button clicked, open dialog
        resetAddFormInputs(false);
        // update modal window title and button text
        $('#addModalLabel').text('Add a new contact');
        $('#addContactConfirmed').text('Create contact').data('formuse', 'add');
        
        $('#addModal').modal('show');
    });
    
    $('#editButton').click(function(event) {
        // Edit contact button clicked, open dialog
        resetAddFormInputs(true); // prefill form with current data
        // update modal window title and button text
        $('#addModalLabel').text('Edit contact');
        $('#addContactConfirmed').text('Edit contact').data('formuse', 'edit');
        
        $('#addModal').modal('show');
    });
    
    $('#deleteButton').click(function() {
        // Delete button clicked, delete the selected contact
        var cid = $('#oneContactDetails').data('contactid');
        $.ajax({
            url: '/contacts/' + cid,
            type: 'DELETE',
            dataType: 'text', // expected response type
        }).done(function() {
            resetContactDetailsBox(); // remove the deleted contact details from the web page
            // remove the deleted contact from the contacts list
            // data attribute selector does not work with dynamically added data attributes, so loop instead
            var contacts = contactsList.children();
            for (var i = 0; i < contacts.length; i++) {
                if (contacts.eq(i).data('id') === cid) {
                    contacts.eq(i).remove();
                    break;
                }
            }
            $('#editButton').prop('disabled', true); // disable edit/delete buttons
            $('#deleteButton').prop('disabled', true);
            if (contactsList.children().length === 0) {
                // the last contact was deleted, display "no contacts" item
                contactsList.append(createNoContactsItem());
            }
        }).fail(function() {
            showErrorAlert('Deleting the contact failed.');
        });
    });
    
    /* When OK button is pressed in the "add contact" modal dialog. 
       The same dialog is used for both adding and editing, 
       confirm button data attribute is set to either one. */
    $('#addForm').submit(function(event) {
        event.preventDefault();
        // email input should be validated by the browser (input type email)
        if ($('#addContactConfirmed').data('formuse') === 'add') {
            // create a new contact
            $.ajax({
                url: '/contacts',
                type: 'POST',
                data: JSON.stringify(mkContactObjectFromForm()),
                contentType: 'application/json', // request payload in JSON
                dataType: 'text', // response is actually going to be empty (with Location header)
            }).done(function(responseData, textStatus, jqXHR) {
                // add the new contact to left-side contacts list without refreshing the complete page
                $.getJSON(jqXHR.getResponseHeader('Location'), function(contact) {
                    // remove the list item that is displayed when there are no contacts
                    $('#noContactsItem').remove();
                    if ($('#searchInput').val().length > 0) {
                        // the user has filtered the contacts list, so adding will reset it 
                        // and show all contacts, including the new one
                        $('#searchInput').val('');
                        contactsList.empty();
                        fillContactsList({"fields": "name"});
                    } else {
                        contactsList.append(createContactsListItem(contact));
                    }
                });
            }).fail(function() {
                showErrorAlert('Creating the new contact failed.');
            });
        } else {
            // edit existing contact
            var cid = $('#oneContactDetails').data('contactid');
            $.ajax({
                url: '/contacts/' + cid,
                type: 'PUT',
                data: JSON.stringify(mkContactObjectFromForm()),
                contentType: 'application/json', // request payload in JSON
                dataType: 'text', // response is actually going to be empty
            }).done(function() {
                // the contact has been edited and the details box should be updated
                updateContactDetailsBox(cid, true);
            }).fail(function() {
                showErrorAlert('Editing the contact failed.');
            });
        }
        $('#addModal').modal('hide');
    });
    
    $('#searchForm').submit(function(event) {
        event.preventDefault();
        contactsList.empty(); // empty before adding new search results to the list
        var searchFor = $('#searchInput').val();
        var query = {"fields": "name"}; // server returns only contact names
        if (searchFor.length > 0) {
            // search input is not empty
            query.name = searchFor;
            // if search field is empty, get all contacts
        }
        
        // Search for the name given in the search form field. 
        // Replace the contents of the contacts list with the search results. 
        fillContactsList(query);
    });
    
});
