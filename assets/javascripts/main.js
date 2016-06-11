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

moveDateMarkerTo = function(string){
  var datesEls = $("nav .dates"),
    date = moment(string, "YYYY-MM-DD"),
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
    $(redLineEl).removeClass("hidden");
  });
}

var eventSource   = $("#event-template").html();
var eventTemplate = Handlebars.compile(eventSource);
var region   = $("#events-region");

$.getJSON('/events.json', function(data){

  // Sort chronologically
  data.sort(function(a, b) {
    return moment(a.date, "YYYY-MM-DD") - moment(b.date, "YYYY-MM-DD");
  });


  // Reorder the array so that events start from the current month
  var thisMonth = moment().month();

  $.each(data, function(index, item){
    // If we've reached this month (or later), this is where we want to split.
    if (moment(item.date, "YYYY-MM-DD").month() >= thisMonth) {
      // Split the array in two
      var before = data.slice(0, index),
        after = data.slice(index);
      // And stich it together again, with this month at the front
      data = after.concat(before);

      // Returning false will break the $.each loop
      return false;
    }
  });

  // Clear out the Enable JS message
  region.html("");

  // Create and append the event elements using handlebars
  $.each(data, function(index, item){

    // Make this event drop an anchor if it's the first for its month
    var month = moment(item.date, "YYYY-MM-DD").format("MMM").toLowerCase();
    if($("#" + month).length == 0){
      // The template will add an anchor
      item.id = month;
      // And let's activate the month in the nav bar
      $("a[href='#" + month + "']").addClass("present");
    }

    var el = $(eventTemplate(item));
    el.appendTo(region);

    // Add a waypoint so that the date nav scrolls to this event's month when
    // you scroll past it
    $(el).waypoint({
      handler: function(direction) {
        moveDateMarkerTo(el.data("date"));
      },
      offset: '48px'
    });
  });

  // If the page isn't scrolled already (which would trigger the dateMarker
  // movement), then move the dateMarker to the date of the first event in the
  // list (probably this month)
  if ($(window).scrollTop() < 48) {
    var firstEl = $(".event").first(),
      firstDate = firstEl.data("date");

    // Do it with a timeout, because otherwise the position is off for unknown
    // reasons
    setTimeout(function() {
      moveDateMarkerTo(firstDate);
    }, 30);
  }

});