// Application code starts here. The code is wrapped in a
// function closure to prevent overwriting global objects.
(function()
{
  // Dictionary of beacons.
  // Detected beacons go inside of this dictionary
  var beacons = {};
  //need to use a global toggle for checkBeaconProximity
  var displayedPage = false;
  // Timer that displays list of beacons.
  var timer = null;
  function onDeviceReady()
  {
    // Start tracking beacons!
    setTimeout(startScan, 500);
    // Timer that refreshes the display.
    timer = setInterval(updateBeaconList, 500);
  }

  function checkBeaconProximity(beacon) {
    // the beacon, rssi and address all comes from the eddystone library to make
    //things easier
    if (beacon.rssi >= -85 && beacon.address == "01:17:C5:57:5F:6D") {
      console.log("In range");
      //need another if statement
      if (displayedPage == false) {
        console.log("did this run?");
        window.location = beacon.url;
        //want to console log some data?
        console.log("The RSSI value is: " + beacon.rssi);
        console.log("The address is : " + beacon.address);
        displayedPage = true;
      }
    }
  }

  function startScan()
  {
    showMessage('Scan in progress.');
    evothings.eddystone.startScan(
      function(beacon)
      {
        // Update beacon data.
        beacon.timeStamp = Date.now();
        beacons[beacon.address] = beacon;
      },
      function(error)
      {
        showMessage('Eddystone scan error: ' + error);
      });
  }
  // Map the RSSI value to a value between 1 and 100.
  function mapBeaconRSSI(rssi)
  {
    if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
    if (rssi < -100) return 100; // Max RSSI
    return 100 + rssi;
  }
  function getSortedBeaconList(beacons)
  {
    var beaconList = [];
    for (var key in beacons)
    {
      beaconList.push(beacons[key]);
    }
    beaconList.sort(function(beacon1, beacon2)
    {
      return mapBeaconRSSI(beacon1.rssi) < mapBeaconRSSI(beacon2.rssi);
    });
    return beaconList;
  }
  function updateBeaconList()
  {
    removeOldBeacons();
    displayBeacons();
  }
  function removeOldBeacons()
  {
    var timeNow = Date.now();
    for (var key in beacons)
    {
      // Only show beacons updated during the last 60 seconds.
      var beacon = beacons[key];
      if (beacon.timeStamp - 60000 > timeNow)
      {
        delete beacons[key];
      }
    }
  }
  function displayBeacons()
  {
    var html = '';
    var sortedList = getSortedBeaconList(beacons);
    for (var i = 0; i < sortedList.length; ++i)
    {
      // here is the beacon object
      var beacon = sortedList[i];
      var htmlBeacon =
        '<p>'
        +	htmlBeaconName(beacon)
        +	htmlBeaconURL(beacon)
        +	htmlBeaconNID(beacon)
        +	htmlBeaconBID(beacon)
        +	htmlBeaconVoltage(beacon)
        +	htmlBeaconTemperature(beacon)
        +	htmlBeaconRSSI(beacon)
        + '</p>';
      html += htmlBeacon
      //want to add our checkBeaconProximity here, where the beacon object can be accessed
      // checks proximity using the beacon RSSI
      checkBeaconProximity(beacon);
    }
    document.querySelector('#found-beacons').innerHTML = html;
  }
  function htmlBeaconName(beacon)
  {
    var name = beacon.name || 'no name';
    return '<strong>' + name + '</strong><br/>';
  }
  function htmlBeaconURL(beacon)
  {
    return beacon.url ?
      'URL: ' + beacon.url + '<br/>' :  '';
  }
  function htmlBeaconURL(beacon)
  {
    return beacon.url ?
      'URL: ' + beacon.url + '<br/>' :  '';
  }
  function htmlBeaconNID(beacon)
  {
    return beacon.nid ?
      'NID: ' + uint8ArrayToString(beacon.nid) + '<br/>' :  '';
  }
  function htmlBeaconBID(beacon)
  {
    return beacon.bid ?
      'BID: ' + uint8ArrayToString(beacon.bid) + '<br/>' :  '';
  }
  function htmlBeaconVoltage(beacon)
  {
    return beacon.voltage ?
      'Voltage: ' + beacon.voltage + '<br/>' :  '';
  }
  function htmlBeaconTemperature(beacon)
  {
    return beacon.temperature && beacon.temperature != 0x8000 ?
      'Temperature: ' + beacon.temperature + '<br/>' :  '';
  }
  function htmlBeaconRSSI(beacon)
  {
    return beacon.rssi ?
      'RSSI: ' + beacon.rssi + '<br/>' :  '';
  }
  function uint8ArrayToString(uint8Array)
  {
    function format(x)
    {
      var hex = x.toString(16);
      return hex.length < 2 ? '0' + hex : hex;
    }
    var result = '';
    for (var i = 0; i < uint8Array.length; ++i)
    {
      result += format(uint8Array[i]) + ' ';
    }
    return result;
  }
  function showMessage(text)
  {
    document.querySelector('#message').innerHTML = text;
  }
  // This calls onDeviceReady when Cordova has loaded everything.
  document.addEventListener('deviceready', onDeviceReady, false);
})(); // End of closure.
