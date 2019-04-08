class SolarDataBuilder{
  constructor(sunset_sunrise_org_data) { }

  getDatePoints(sunrise_sunset_org_results){
    var dateFormat = 'YYYY-MM-DD hh:mm:ss A'
    var datePoints = []

    var solarDates = this.getSolarDates(sunrise_sunset_org_results);
    var solarLoop = this.getSolarLoop(solarDates)


    var datePoint = moment.utc(
      "1999-12-30 <setTimeHere>".replace("<setTimeHere>",sunrise_sunset_org_results.sunrise),dateFormat)
    var solarLoopState = "sunrise"

    for(var i = 0 ; i<= 11 ; i++){
      var to_next_milliseconds = solarLoop[solarLoopState].to_next_milliseconds
      var solarLoopState = solarLoop[solarLoopState].next_state
      datePoint = moment.utc(
        datePoint.clone().add(to_next_milliseconds,'milliseconds').format(dateFormat),dateFormat)
      datePoints.push({date: datePoint, solar_state: solarLoopState});
    }
    return datePoints;
  }

  getSolarLoop(solarDates)
  {
    var sunset_to_sunrise = solarDates["sunrise"].clone().add(1,'day').diff(solarDates["sunset"])
    var solarLoop = {}
    solarLoop["sunrise"] = {
      to_next_milliseconds: Math.abs(solarDates["solar_noon"].diff(solarDates["sunrise"])),
      to_prev_milliseconds: sunset_to_sunrise/2}
    solarLoop["noon"] = {
      to_next_milliseconds: Math.abs(solarDates["sunset"].diff(solarDates["solar_noon"])),
      to_prev_milliseconds: Math.abs(solarDates["solar_noon"].diff(solarDates["sunrise"]))}
    solarLoop["sunset"] = {
      to_next_milliseconds: sunset_to_sunrise/2,
      to_prev_milliseconds: Math.abs(solarDates["sunset"].diff(solarDates["solar_noon"]))}
    solarLoop["midnight"] = {
      to_next_milliseconds: sunset_to_sunrise/2,
      to_prev_milliseconds: sunset_to_sunrise/2
    }

    solarLoop["sunrise"]["next_state"] =   "noon"
    solarLoop["noon"]["next_state"] =   "sunset"
    solarLoop["sunset"]["next_state"] =   "midnight"
    solarLoop["midnight"]["next_state"] =   "sunrise"

    solarLoop["sunrise"]["prev_state"] =   "midnight"
    solarLoop["noon"]["prev_state"] =   "sunrise"
    solarLoop["sunset"]["prev_state"] =   "noon"
    solarLoop["midnight"]["prev_state"] =   "sunset"

    return solarLoop;
  }

  getSolarDates(sunrise_sunset_org_results)
  {
    var solarDates = {};
    var dateTemplate = "2000-01-0<day> <setTimeHere>"
    var dateFormat = 'YYYY-MM-DD hh:mm:ss A'
    var day = 1

    var solar_states = ["sunrise","solar_noon","sunset"];

    solar_states.forEach(function(solar_state, index){
      if(index != 0 )
      {
        // on every pm to am transition, add a new day.
        if(sunrise_sunset_org_results[solar_state].includes('AM') &&
          sunrise_sunset_org_results[solar_states[index-1]].includes('PM')){
          day = day + 1;
        }
      }

      solarDates[solar_state] = moment.utc(
      dateTemplate
        .replace('<setTimeHere>', sunrise_sunset_org_results[solar_state])
        .replace('<day>', day),
      dateFormat);

    });

    return solarDates;
  }
}