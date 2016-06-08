# Contributing

Thanks for helping to improve ConfCal. Create an issue for any bugs, errors,
or omissions you spot.

## Adding a new Event

To add an event, create a PR or open an issue which has a JSON object containing:

| key | description |
|-----|-------------|
| title| The name of the conference or event. |
| location | The city and country, or `"Global (changes annually)"` if it changes each year. |
| date | When the conference occurs. Read more below. |
| url | The URL for the conference / registration. |
| banner_url | An image which can be used in the top featured section. |
| tags | An array of strings. Max of 4, so choose wisely. |
| coc_url | The URL for the event's Code of Conduct. |
| diversity_url | The URL for the event's Diversity statement |
| rfp_expenses | A boolean: `true` if some or all of the speaker expenses are paid. |

### Examples

See https://github.com/confcal/confcal.github.io/blob/master/events.json

### Date

In general, a date of the form `0000-MM-DD` is prefered. In other words, the
year is `0000`. The date portion can be the last known date, or the next date,
or a generalised date.

In the UI, a day of `0-9` is shown as "Early", `10-19` is shown as "Mid",
and `20+` is shown as "Late". E.g. `0000-01-01` is "Early Jan",
`0000-01-22` is "Late Jan".

Using the date of the next event is also acceptable, including the year. E.g.
`2017-05-05`.

### Banner Images

You'll need to open a PR which includes an appropriately named image (lowercase,
alphanumeric, dashes instead of spaces). Keep it max 1MB. Store it in
`/assets/images/`.

### Acceptance Criteria

Acceptance of an event to ConfCal is at the sole discretion of the maintainers.
To keep quality high, this may also involve us looking at the following:

  - a good history of the event
  - active social media presence / interaction
  - presence of a code of conduct
