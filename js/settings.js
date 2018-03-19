
Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}


/**
 * Settings Storage
 *
 * The user settings are stored in the chrome storage and are synced between browsers
 * where sync is enabled.
 *
 * When the save button is clicked, all current values are stored to the chrome storage.
 * When the cancel button is clicked, the current values are overwritten by the last
 * that were saved.
 *
 * Values from the storage can be passed to a callback via get(key, callback)
 */
var Settings = function(jQuery, form) {
  var $ = jQuery;
  var $settings = $(form);

  // Save and sync all settings
  var save = function(){

    var period_lengths = {"item-day": 1, "item-week": 7, "item-month": 30};

    var link_url = document.getElementById('site-url').value;
    var freq_val = document.getElementById('freq_val').value;
    var freq_type = document.getElementById('freq_type').value;

    if(!link_url || 0 === link_url.length){
      alert("Empty URL field");
      return;
    }else if(!freq_val || 0 === freq_val.length){
      alert("Reminder frequency not specified");
      return;
    }else if(!$.isNumeric(freq_val)){
      alert("Invalid reminder frequency");
      return;
    }

    freq_val = parseInt(freq_val);
    var curr_date = new Date();
    var next_reminder = curr_date.addDays(freq_val * period_lengths[freq_type]);

    console.log("Remind to visit " + link_url + " on " + next_reminder);

    var options = {};
    options[link_url] = {
      "link": link_url,
      "freq_val": freq_val,
      "freq_type": freq_type,
      "next_reminder": next_reminder.toString()
    };

    // // Processing all text and select inputs
    // $('input[type="text"], select', $settings).each(function(index, item) {
    //   options[$(item).attr('name')] = $(item).val();
    // });
    //
    // // Processing radio inputs
    // $('input[type="radio"]', $settings).each(function(index, item) {
    //   if($(item).is(":checked")){
    //     options[$(item).attr('name')] = $(item).val();
    //   }
    // });
    //
    // // Processing all checkboxes
    // $('input[type="checkbox"]', $settings).each(function(index, item) {
    //   options[$(item).attr('name')] = ($(item).is(":checked")) ? true : false;
    // });

    // Syncing the data with the storage
    chrome.storage.sync.set(options, function() {
      console.log('Saved the settings');
    });
  };

  // Initialize the settings
  var initialize = function() {
    chrome.storage.sync.get(null, function(items) {

      var period_labels = {"item-day": "day", "item-week": "week", "item-month": "month"};
      $("#reminder-list table tbody").empty();

      $.each(items, function(key, value){
        console.log(key + ": " + value);
        if(typeof value  === 'object' && !(value instanceof Array)){
          console.log(value["link"]);
          console.log(value["freq_val"]);
          console.log(value["freq_type"]);
          console.log(value["next_reminder"]);

          var plural = "";
          if(value["freq_val"] > 1){
            plural = "s";
          }
          var tr =
            '<tr>'+
               '<td><a href=\"'+value["link"]+'\">' + value["link"] + '</a></td>'+
               '<td>'+ "Every " + value["freq_val"] + " " +
               period_labels[value["freq_type"]] + plural +'</td>'+
            '</tr>';
           $("#reminder-list table tbody").append(tr);
        }
      });

      // var $item = null;
      // $.each(e, function(key, value) {
      //   $item = $('[name="' + key + '"]', $settings);
      //   if($item.length > 0){
      //     if($item[0].type == 'text' || $item[0].type == 'select-one'){
      //       $item.val(value);
      //     }
      //
      //     else if($item[0].type == 'checkbox'){
      //       if(value){
      //         $item.prop('checked', true);
      //       }
      //     }
      //
      //     else {
      //       $('[name="' + key + '"][value="' + value + '"]', $settings).prop('checked', true);
      //     }
      //   }
      // });
    });
  };

  // Pass a value by its key to a callback function
  this.get = function(key, callback) {
    var value = chrome.storage.sync.get(key, function(e) {
      callback(e[key]);
    });
  }

  // Action when the save button is clicked
  $('.save-settings').click(function(e) {
    e.preventDefault();
    save();
  });

  // Action when the cancel button is clicked
  $('.cancel-settings').click(function(e) {
    e.preventDefault();
  });

  // Action when the list tab is clicked
  $('#list-tab').click(function(e) {
    initialize();
  });

};