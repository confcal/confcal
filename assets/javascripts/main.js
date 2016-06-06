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

var source   = $("#event-template").html();
var template = Handlebars.compile(source);

var region   = $("#events-region");

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
      newMonth = $("nav .dates").find("a[data-month='" + month + "']"),
      // The month, shifted to the right depending on where in the month we are
      position = newMonth.position().left + newMonth.width() * positionMultiplier;

    $(redLineEl).animate({left: position});
  });
}

$.getJSON('/events.json', function(data){
  data.sort(function(a, b) {
    return moment(a.date).isAfter( moment(b.date) );
  });

  $.each(data, function(index, item){
    var el = $(template(item));
    el.appendTo(region);
    $(el).waypoint({
      handler: function(direction) {
        moveDateMarkerTo(el.data("date"));
      },
      offset: '48px'
    });
  });
});
