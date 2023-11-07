function onCreate() {
  setValueAttr("employee", CurrentDocument.initiatorId);
  setdateRate();
}

function onCardInitialize() {
  debugger;
  //onChangedateRate();
  //onChangeCurrencyFrom();
  //onChangeCurrencyTo();
  //onChangeDate();
  setPropstravelDirection();
  onChangeemployee();
}

function onBeforeCardSave() {
  checkForCyrillic();
}

function onChangeemployee() {
  setValueAttr("directorInityator", null);
  if (EdocsApi.getAttributeValue("employee").value) {
    setdirectorInityator();
    setemployeeId();
    setEmployeeInfo();
  }
}

function setemployeeId() {
  var employee = EdocsApi.getAttributeValue("employee").value;
  var employeeId = EdocsApi.getAttributeValue("employeeId").value;
  if (employee)
    employeeId = EdocsApi.getEmployeeDataByEmployeeID(employee).personId;
  if (employeeId != EdocsApi.getAttributeValue("employeeId").value)
    setValueAtt("employeeId", employeeId);
}

function setdirectorInityator() {
  var employee = EdocsApi.getAttributeValue("employee").value;
  if (!EdocsApi.getAttributeValue("directorInityator").value && employee) {
    var manager = EdocsApi.getEmployeeManagerByEmployeeID(employee);
    if (manager) {
      var unitLevel = manager.unitLevel;
      if (manager.employeeId == Number(employee)) {
        manager = EdocsApi.getEmployeeManagerByEmployeeID(
          manager.employeeId,
          manager.unitLevel - 1
        );
        if (manager) {
          setValueAtt("directorInityator", manager.employeeId);
        } else {
          var i = 2;
          while (!manager && unitLevel > 1) {
            manager = EdocsApi.getEmployeeManagerByEmployeeID(
              employee,
              unitLevel - i
            );
            i++;
          }
          setValueAtt("directorInityator", manager.employeeId);
        }
      } else {
        setValueAtt("directorInityator", manager.employeeId);
      }
    } else {
      var empl = EdocsApi.getEmployeeDataByEmployeeID(employee);
      manager = EdocsApi.getEmployeeManagerByEmployeeID(
        empl.employeeId,
        empl.unitLevel - 1
      );
      if (manager) setValueAtt("directorInityator", manager.employeeId);
    }
  }
  onChangedirectorInityator();
}

function onChangetable2() {
  copyTablToFields();
  calculateDaysCount();
  setAndCalculateDays();
  setCalculationOfValues();
}

function copyTablToFields() {
  var table = EdocsApi.getAttributeValue("table2").value;
  var Period_from_copy = "";
  var period_to_copy = "";
  var DaysCount_copy = "";
  var DestinationPlaceCopy = "";
  var ObjectBusinesTripCopy = "";

  if (table) {
    for (var i = 0; i < table.length; i++) {
      var Period_from = EdocsApi.findElementByProperty(
        "code",
        "Period_from",
        table[i]
      ).value;
      var period_to = EdocsApi.findElementByProperty(
        "code",
        "period_to",
        table[i]
      ).value;
      var DaysCount = EdocsApi.findElementByProperty(
        "code",
        "DaysCount",
        table[i]
      ).value;
      var DestinationPlace = EdocsApi.findElementByProperty(
        "code",
        "DestinationPlace",
        table[i]
      ).value;
      var ObjectBusinesTrip = EdocsApi.findElementByProperty(
        "code",
        "ObjectBusinesTrip",
        table[i]
      ).value;

      Period_from_copy += moment(Period_from).format("DD.MM.YYYY") + "\n\n";
      period_to_copy += moment(period_to).format("DD.MM.YYYY") + "\n\n";
      DaysCount_copy += DaysCount + "\n\n";
      DestinationPlaceCopy += DestinationPlace + "\n\n";
      ObjectBusinesTripCopy += ObjectBusinesTrip + "\n\n";
    }
  }

  EdocsApi.setAttributeValue({
    code: "Period_from_copy",
    value: removeLastSlash(Period_from_copy),
    text: null,
  });
  EdocsApi.setAttributeValue({
    code: "period_to_copy",
    value: removeLastSlash(period_to_copy),
    text: null,
  });
  EdocsApi.setAttributeValue({
    code: "DaysCount_copy",
    value: removeLastSlash(DaysCount_copy),
    text: null,
  });
  EdocsApi.setAttributeValue({
    code: "DestinationPlaceCopy",
    value: removeLastSlash(DestinationPlaceCopy),
    text: null,
  });
  EdocsApi.setAttributeValue({
    code: "ObjectBusinesTripCopy",
    value: removeLastSlash(ObjectBusinesTripCopy),
    text: null,
  });
}

function removeLastSlash(str) {
  if (str.substring(str.length - 1, str.length) === "|") str = str.slice(0, -1);
  return str;
}

function onChangePeriod_from() {
  calculateDaysCount();
}

function onChangeperiod_to() {
  calculateDaysCount();
}

function calculateDaysCount() {
  var Period_from = EdocsApi.getAttributeValue("Period_from").value;
  var period_to = EdocsApi.getAttributeValue("period_to").value;
  if (Period_from && period_to)
    setValueAttr(
      "DaysCount",
      EdocsApi.getVacationDaysCount(Period_from, period_to)
    );
}

function setAndCalculateDays() {
  var table = EdocsApi.getAttributeValue("table2").value;
  if (table && table.length > 0) {
    var Period_from = EdocsApi.findElementByProperty(
      "code",
      "Period_from",
      table[0]
    ).value;

    var workDays = getWorkDays(
      new Date(new Date(CurrentDocument.created).setHours(0, 0, 0, 0)),
      new Date(new Date(Period_from).setHours(0, 0, 0, 0))
    );
    if (workDays < 7) {
      setValueAttr("DaysForStartTrip", workDays);
      EdocsApi.message(
        "Документ створюється менше ніж за 7 робочих днів до відрядження, і буде відправлений на попереднє узгодження до О.Ладан, та може бути відхиленим"
      );
      //  throw "Обмеження створення документу за 7 роб днів.";
    } else {
      if (workDays > 30) {
        throw "Документи можна створювати не раніше ніж за 30 робочих днів до початку відрядження";
      }
      setValueAttr("DaysForStartTrip", "");
    }
    // if (workDays == 7) {throw "Обмеження створення документу за 7 роб днів."}

    var period_to = EdocsApi.findElementByProperty(
      "code",
      "period_to",
      table[table.length - 1]
    ).value;
    setValueAttr("dataTripStart", Period_from);
    setValueAttr("dataTripEnd", period_to);
    setValueAttr("days", EdocsApi.getVacationDaysCount(Period_from, period_to));
  } else {
    setValueAttr("dataTripStart", null);
    setValueAttr("dataTripEnd", null);
    setValueAttr("days", null);
  }
}

function getWorkDays(fromDate, toDate) {
  var daysCount = 0;
  while (fromDate < toDate) {
    if (!(fromDate.getDay() == 0 || fromDate.getDay() == 6)) daysCount++;
    fromDate = fromDate.addDays(1);
  }
  return daysCount;
}

//1.Заповнити поле Rate методом зовнішньої системи EdocsGetExchangeRate
function setRate() {
  //debugger;
  const currencyEUR = EdocsApi.getAttributeValue("currencyEUR");
  const dateRate = EdocsApi.getAttributeValue("dateRate").value;

  if (currencyEUR.value && dateRate) {
    const methodData = {
      currencyEUR: currencyEUR.value,
      dateRate: dateRate,
    };

    const response = EdocsApi.runExternalFunction(
      "Navision",
      "EdocsGetExchangeRate",
      methodData
    );

    if (!response.data) {
      throw "Не отримано відповіді від зовнішньої системи";
    } else {
      if (response.data.error) {
        EdocsApi.message(response.data.error.message);
      } else {
        EdocsApi.setAttributeValue(response.data);
      }
    }
  } else {
    if (!currencyEUR.text) {
      EdocsApi.setAttributeValue({ code: "rate", value: null, text: null });
    }
  }
}

function onChangecurrencyEUR() {
  //debugger;
  setDate();
  setRate();
  setmoney_per_day();
  setCalculationOfValues();
  setCurrencyTo();
}

function setCurrencyTo() {
  setValueAttr("CurrencyTo", EdocsApi.getAttributeValue("currencyEUR").value);
  // setCurrencyRate();
  // setmoney_per_day();
  // setRate();
  // setmoney_per_day();
  // setCalculationOfValues();
}

function onChangedateRate() {
  debugger;
  setRate();
  setmoney_per_day();
  setCalculationOfValues();
}

//2. Заповнити поле CrossCourse методом зовнішньої системи EdocsGetCurrencyRate
function setCurrencyRate() {
  const CurrencyFrom = EdocsApi.getAttributeValue("CurrencyFrom").value;
  const CurrencyTo = EdocsApi.getAttributeValue("CurrencyTo").value;
  const date = EdocsApi.getAttributeValue("Date").value;
  if (CurrencyFrom && CurrencyTo && date) {
    const methodData = {
      CurrencyFrom: CurrencyFrom,
      CurrencyTo: CurrencyTo,
      Date: date,
    };
    const response = EdocsApi.runExternalFunction(
      "Navision",
      "EdocsGetCurrencyRate",
      methodData
    );
    if (!response.data) {
      throw "Не отримано відповіді від зовіншньої системи";
    } else {
      if (response.data.error) {
        EdocsApi.message(response.data.error);
      } else {
        EdocsApi.setAttributeValue({
          code: Object.keys(response.data)[0],
          value: Object.values(response.data)[0],
        });
      }
    }
  } else {
    setValueAttr("CrossCourse", null);
  }
}
function onChangeCurrencyFrom() {
  debugger;
  setCurrencyRate();
  setRate();
  setmoney_per_day();
  setCalculationOfValues();
}

function onChangeCurrencyTo() {
  debugger;
  setCurrencyRate();
  setRate();
  setmoney_per_day();
  setCalculationOfValues();
}

function onChangeDate() {
  debugger;
  setCurrencyRate();
  setRate();
  setmoney_per_day();
  setCalculationOfValues();
}

//3. Заповнити інформацію по співробітнику методом зовнішньої системи EdocsGetEmploeeInfo
function setEmployeeInfo() {
  const employeeId = EdocsApi.getAttributeValue("employeeId").value;
  if (employeeId) {
    const response = EdocsApi.runExternalFunction(
      "Navision",
      "EdocsGetEmploeeInfo",
      {
        employeeId: employeeId,
      }
    );
    if (!response.data) {
      throw "Не отримано відповіді від зовіншньої системи";
    } else {
      if (response.data.error) {
        EdocsApi.message("Ваших даних немає в зовнішній системі");
      } else {
        setValueAttr("name", response.data.attributeValues[0].name);
        setValueAttr("surname", response.data.attributeValues[0].surname);
        setValueAttr("LastName", response.data.attributeValues[0].LastName);
        setValueAttr("position", response.data.attributeValues[0].position);
        setValueAttr("unit", response.data.attributeValues[0].unit);
        setValueAttr("department", response.data.attributeValues[0].department);
      }
    }
  } else {
    setValueAttr("name", null);
    setValueAttr("surname", null);
    setValueAttr("LastName", null);
    setValueAttr("position", null);
    setValueAttr("unit", null);
    setValueAttr("department", null);
  }
}

function setControlRequired(code, required = true) {
  const control = EdocsApi.getControlProperties(code);
  control.required = required;
  EdocsApi.setControlProperties(control);
}

//Скривати поле Країна
function setControlHidden(code, hidden = true) {
  const control = EdocsApi.getControlProperties(code);
  control.hidden = hidden;
  EdocsApi.setControlProperties(control);
}

function setControlDisabled(code, disabled = true) {
  const control = EdocsApi.getControlProperties(code);
  control.disabled = disabled;
  EdocsApi.setControlProperties(control);
}

function setcountry(travelDirection) {
  if (
    travelDirection == "Україна" &&
    EdocsApi.getAttributeValue("country").value != "Україна"
  ) {
    setValueAttr("country", "Україна");
  } else {
    if (EdocsApi.getAttributeValue("country").value == "Україна")
      setValueAttr("country", null);
  }
}

function setPropstravelDirection() {
  var travelDirection = EdocsApi.getAttributeValue("travelDirection").value;
  if (travelDirection == "За кордон") {
    setControlHidden("currencyEUR", false);
    setControlRequired("currencyEUR");
    setControlHidden("dateRate", false);
    setControlRequired("dateRate");
    setControlHidden("rate", false);
    setControlRequired("rate");
    setControlHidden("amountCurrency", false);
    setControlRequired("amountCurrency", false);
    setControlDisabled("amountCurrency");
  } else {
    setControlHidden("currencyEUR");
    setControlRequired("currencyEUR", false);
    setControlHidden("dateRate");
    setControlRequired("dateRate", false);
    setControlHidden("rate");
    setControlRequired("rate", false);
    setControlHidden("amountCurrency");
    setControlRequired("amountCurrency", false);
    setControlHidden("CurrencyFrom");
    setControlRequired("CurrencyFrom", false);
    setControlHidden("CurrencyTo");
    setControlRequired("CurrencyTo", false);
    setControlHidden("Date");
    setControlRequired("Date", false);
    setControlHidden("CrossCourse");
  }
  setCalculationOfValues();
}

function onChangetravelDirection() {
  debugger;
  var travelDirection = EdocsApi.getAttributeValue("travelDirection").value;

  switch (travelDirection) {
    case "Україна":
      setValueAttr("currencyEUR", null, null);
      setValueAttr("Date", null, null);
      setValueAttr("dateRate", null, null);
      setValueAttr("rate", null, null);
      setValueAttr("CrossCourse", null, null);
      break;

    case "За кордон":
      setValueAttr("sumAll", null, null);
      break;

    default:
      break;
  }

  setcountry(travelDirection);
  setPropstravelDirection();
  setcurrencyEUR();
  if (EdocsApi.getAttributeValue("currencyEUR").value) {
    setDate();
    setRate();
    setmoney_per_day();
  }
}

function validationNumber(attrValue) {
  let number;
  attrValue
    ? (number = parseFloat(attrValue.split(",").join(".")).toFixed(2))
    : (number = 0);
  return number;
}

function setValueAttr(code, value, text) {
  const attr = EdocsApi.getAttributeValue(code);
  attr.value = value;
  attr.text = text;
  EdocsApi.setAttributeValue(attr);
}

function setCalculationOfValues() {
  //debugger;
  const travelDirection = EdocsApi.getAttributeValue("travelDirection").value;

  let days = EdocsApi.getAttributeValue("days");
  if (days.value && travelDirection) {
    days = days.value;

    let flightENG = EdocsApi.getAttributeValue("FlightENG").value;
    let hotelENG = EdocsApi.getAttributeValue("HotelENG").value;
    let taxiENG = EdocsApi.getAttributeValue("TaxiENG").value;
    let car_relatedENG = EdocsApi.getAttributeValue("Car_relatedENG").value;
    let publicTransportENG =
      EdocsApi.getAttributeValue("PublicTransportENG").value;
    let rate = 1;
    let flight = EdocsApi.getAttributeValue("Flight").value;
    let hotel = EdocsApi.getAttributeValue("Hotel").value;
    let taxi = EdocsApi.getAttributeValue("Taxi").value;
    let other_costs = EdocsApi.getAttributeValue("Other_costs").value;
    let other_costsENG = EdocsApi.getAttributeValue("other_costsENG");
    let money_per_day1 = EdocsApi.getAttributeValue("money_per_day1").value;

    if (travelDirection == "За кордон") {
      rate = EdocsApi.getAttributeValue("rate").value;
    }

    flightENG = validationNumber(flightENG);
    hotelENG = validationNumber(hotelENG);
    taxiENG = validationNumber(taxiENG);
    car_relatedENG = validationNumber(car_relatedENG);
    publicTransportENG = validationNumber(publicTransportENG);
    flight = validationNumber(flight);
    hotel = validationNumber(hotel);
    taxi = validationNumber(taxi);
    other_costs = validationNumber(other_costs);
    other_costsENG = validationNumber(other_costsENG);

    flight = (flightENG * rate).toFixed(2);
    hotel = (hotelENG * rate).toFixed(2);
    taxi = (taxiENG * rate).toFixed(2);
    car_related = (car_relatedENG * rate).toFixed(2);
    publicTransport = (publicTransportENG * rate).toFixed(2);
    other_costs = (other_costsENG * rate).toFixed(2);
    let amountCurrency =
      Number(flightENG) +
      Number(hotelENG) +
      Number(taxiENG) +
      Number(car_relatedENG) +
      Number(publicTransportENG) +
      Number(other_costsENG);
    let sumAll = (money_per_day1 * days).toFixed(2);
    setValueAttr("Flight", flight);
    setValueAttr("Hotel", hotel);
    setValueAttr("Taxi", taxi);
    setValueAttr("Car_related", car_related);
    setValueAttr("PublicTransport", publicTransport);
    setValueAttr("Other_costs", other_costs);
    setValueAttr("amountCurrency", amountCurrency.toFixed(2));
    setValueAttr("sumAll", sumAll);
    setValueAttr(
      "Transportation",
      (
        Number(EdocsApi.getAttributeValue("Flight").value) +
        Number(EdocsApi.getAttributeValue("Taxi").value) +
        Number(EdocsApi.getAttributeValue("PublicTransport").value)
      ).toFixed(2)
    );
    setValueAttr(
      "Total",
      (
        Number(EdocsApi.getAttributeValue("Transportation").value) +
        Number(EdocsApi.getAttributeValue("Hotel").value) +
        Number(EdocsApi.getAttributeValue("Car_related").value) +
        Number(EdocsApi.getAttributeValue("sumAll").value) +
        Number(EdocsApi.getAttributeValue("Other_costs").value)
      ).toFixed(2)
    );
  }
}

function setmoney_per_day() {
  //debugger;
  var travelDirection = EdocsApi.getAttributeValue("travelDirection").value;
  if (travelDirection) {
    switch (travelDirection) {
      case "Україна":
        if (EdocsApi.getAttributeValue("money_per_day1").text != "850.00") {
          setValueAttr("money_per_day1", "850.00");
        }
        break;

      case "За кордон":
        setValueAttr(
          "money_per_day1",
          (
            Number(EdocsApi.getAttributeValue("CrossCourse").value) *
            Number(EdocsApi.getAttributeValue("CosTravelDay").value) *
            Number(EdocsApi.getAttributeValue("rate").value)
          ).toFixed(2)
        );
        break;

      default:
        break;
    }
  }
}

function onChangerate() {
  setmoney_per_day();
}

function onChangeFlightENG() {
  setCalculationOfValues();
}
function onChangeHotelENG() {
  setCalculationOfValues();
}
function onChangeTaxiENG() {
  setCalculationOfValues();
}
function onChangeCar_relatedENG() {
  setCalculationOfValues();
}
function onChangePublicTransportENG() {
  setCalculationOfValues();
}
function onChangeother_costsENG() {
  setCalculationOfValues();
}
function onChangedays() {
  setCalculationOfValues();
}
function onChangemoney_per_day1() {
  setCalculationOfValues();
}

function onChangeDaysCount() {
  setCalculationOfValues();
}

function onChangedirectorInityator() {
  var directorInityator = EdocsApi.getAttributeValue("directorInityator").value;
  if (directorInityator) {
    const response = EdocsApi.runExternalFunction(
      "Navision",
      "EdocsGetEmploeeInfo",
      {
        employeeId:
          EdocsApi.getEmployeeDataByEmployeeID(directorInityator)?.personId,
      }
    );
    if (response && response.data) {
      if (response.data.error) {
        EdocsApi.message("Інформація по керівнику відсутня");
      } else {
        setValueAttr("ManagerName", response.data.attributeValues[0].name);
        setValueAttr(
          "ManagerSurnames",
          response.data.attributeValues[0].LastName
        );
      }
    } else {
      throw "Не отримано відповіді від зовіншньої системи";
    }
  } else {
    setValueAttr("ManagerName", null);
    setValueAttr("ManagerSurnames", null);
  }
}

//Перевірка кирилиці 0510
function checkForCyrillic() {
  if (
    EdocsApi.getAttributeValue("Annotations").value.search(/[а-яА-Я]/) != "-1"
  )
    throw `Мова введення в поле "Примітки" -  латиниця`;
}

function setDate() {
  //debugger;
  var createdDate = new Date(CurrentDocument.created);
  setValueAttr(
    "Date",
    new Date(
      createdDate.getFullYear(),
      createdDate.getMonth(),
      "01"
    ).toISOString()
  );
}

function setcurrencyEUR() {
  EdocsApi.setAttributeValue({
    code: "currencyEUR",
    value: "UAH",
    text: "Гривня",
    itemCode: "UAH",
    itemDictionary: "EdocsGetCurrencies",
  });
}

function setdateRate() {
  EdocsApi.setAttributeValue({
    code: "dateRate",
    value: moment(CurrentDocument.created).format("DD.MM.YYYY"),
    text: null,
  });
}
