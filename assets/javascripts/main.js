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

$.getJSON('/events.json', function(data){
  data.sort(function(a, b) {
    return moment(a.date).isAfter( moment(b.date) );
  });

  $.each(data, function(index, item){
    var html = template(item);
    region.append(html);
  });
});