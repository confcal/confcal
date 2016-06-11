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

    // If we are between Dec going to Jan, do some nice animation to go "around"
    // Going from Dec to Jan (scrolling down)
    if(month == 1 && $(redLineEl).data("month") == 12){
      var firstMonth = redLineEl.siblings().first();
      $(redLineEl).css({left: firstMonth.position().left});
    }
    // Going from Jan to Dec (scrolling up)
    if(month == 12 && $(redLineEl).data("month") == 1){
      var lastMonth = redLineEl.siblings().last();
      $(redLineEl).css({left: lastMonth.position().left + lastMonth.width() });
    }

    $(redLineEl).data("month", month);
    $(redLineEl).animate({left: position});
    $(redLineEl).removeClass("hidden");
  });
}

var eventSource   = $("#event-template").html();
var eventTemplate = Handlebars.compile(eventSource);
var region   = $("#events-region");

window.data = [];

$.getJSON('/events.json', function(data){

  window.data = data;

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

// A naive Search function, which just iterates through all events

// Don't let nasty search terms through
function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

var searchHeaderSource   = $("#search-header-template").html();
var searchHeaderTemplate = Handlebars.compile(searchHeaderSource);

window.searchEvents = function(query) {
  // Build a safe query string which will match th
  var safeQuery = escapeRegExp(query),
    regex = new RegExp( safeQuery + ".*", 'i'),
    matches = 0;

  // Find any items which match, and show/hide their row
  $.each(data, function(index, item){

    var id = "#" + Handlebars.helpers.toParam(item.title).string,
      otherTerms = "";
    if (!!item.rfp_end) { otherTerms += " rfp " }
    if (!!item.coc_url) { otherTerms += " coc " }
    if (!!item.diversity_url) { otherTerms += " diversity " }
    if(
      query.length == 0 ||
      regex.test(item.title) ||
      regex.test(item.location) ||
      regex.test(moment(item.date, "YYYY-MM-DD").format("MMMM")) ||
      regex.test(item.tags.join(" ")) ||
      regex.test(otherTerms)
    ){
      matches += 1;
      $(id).parent().show();
    } else {
      $(id).parent().hide();
    }
  });


  if (query.length > 0) {
    $("#search-term-region").show();
    var el = $(searchHeaderTemplate({query: query, count: matches}));
    $("#search-term-region").html(el.html());
  } else {
    $("#search-term-region").hide();
  }

}

var searchInput = $("form#search input[name=query]"),
  typingTimer;
searchInput.on("input", function() {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(function() {
    searchEvents( searchInput.val() );
  }, 200);
})