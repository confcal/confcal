Handlebars.registerHelper('toParam', function(string) {
  var string = Handlebars.escapeExpression(string);
  return new Handlebars.SafeString(
     string.replace(/[^0-9a-z\ \-]/gi, '').replace(/\s+/g, '-').toLowerCase()
  );
});
Handlebars.registerHelper('strftime', function(string, format) {
  var string = Handlebars.escapeExpression(string),
      format = Handlebars.escapeExpression(format);

  return new Handlebars.SafeString(
     moment(string).format(format)
  );
});
Handlebars.registerHelper('bucketFromDate', function(string) {
  var string = Handlebars.escapeExpression(string),
      date = moment(string),
      dayOfMonth = date.date();
  if (dayOfMonth <= 10) {
    return "Early";
  } else if (dayOfMonth <= 20) {
    return "Mid";
  } else {
    return "Late";
  }
});

var moveDateMarkerTo = function(string){
  var datesEls = $("nav .dates"),
    date = moment(string),
    month = date.month() + 1,
    dayOfMonth = date.date(),
    positionMultiplier = null;

  if (dayOfMonth <= 10) {
    // Start of the month, but a little to the left for niceness
    positionMultiplier = 0.1;
  } else if (dayOfMonth <= 20) {
    positionMultiplier = 0.5;
  } else {
    // End of the month, but a little to the right for niceness
    positionMultiplier = 0.9;
  }

  $.each(datesEls, function(index, element){
    var redLineEl = $(element).find(".red-line"),
      newMonth = $(element).find("a[data-month='" + month + "']"),
      // The month, shifted to the right depending on where in the month we are
      position = newMonth.position().left + newMonth.width() * positionMultiplier;

    $(redLineEl).animate({left: position});
  });
}

var eventSource   = $("#event-template").html();
var eventTemplate = Handlebars.compile(eventSource);
var region   = $("#events-region");

$.getJSON('/events.json', function(data){
  data.sort(function(a, b) {
    return moment(a.date) - moment(b.date);
  });

  // Clear out the Enable JS message
  region.html("");

  $.each(data, function(index, item){

    // Make this event drop an anchor if it's the first for its month
    var month = moment(item.date).format("MMM").toLowerCase();
    if($("#" + month).length == 0){
      // The template will add an anchor
      item.id = month;
      // And let's activate the month in the nav bar
      $("a[href='#" + month + "']").addClass("present");
    }

    var el = $(eventTemplate(item));
    el.appendTo(region);

    $(el).waypoint({
      handler: function(direction) {
        moveDateMarkerTo(el.data("date"));
      },
      offset: '48px'
    });
  });
});
