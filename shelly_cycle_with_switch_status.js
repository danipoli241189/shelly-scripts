let CONFIG = {
  INPUT_ID: 0,

  CYCLES: [
    [0, "on"],
    [1, "on"],
    [0, "off"],
    [1, "off"],
  ],
};

let idSwitch = 0;

let switch_0_status = 0;

let switch_1_status = 0;

let switchStatus = [];

let targetOperation = [];

let getSwitchStatus = function (id) {
  console.log("controllo switch");
  console.log(id);
  
  idSwitch = id;

  Shelly.call(
    "switch.getstatus",
    { id: idSwitch},
    function (result, error_code, error_message, user_data) {
      if (result.output === true) {
        if (idSwitch === 0) {
          console.log("Gruppo Luci 0 acceso");
          switch_0_status = 1;
          getSwitchStatus(1);
        } else {
          console.log("Gruppo Luci 1 acceso");
          switch_1_status = 1;
          makeDecision(switch_0_status, switch_1_status);
        }
      } else {
        if (idSwitch === 0) {
          console.log("Gruppo Luci 0 spento");
          switch_0_status = 0;
          getSwitchStatus(1);
        } else {
          console.log("Gruppo Luci 1 spento");
          switch_1_status = 0;
          makeDecision(switch_0_status, switch_1_status);
        }
      }
    }
  );
};

let setSwitch = function (idOperation, status) {
  let targetOperation = CONFIG.CYCLES[idOperation];
  Shelly.call("switch.set", {
    id: JSON.stringify(targetOperation[0]),
    on: status === "on",
  });
};

let makeDecision = function (status0, status1) {
  if (status0 === 0 && status1 === 0) {
    console.log("Accendo Gruppo 0");
    setSwitch(0, "on");
  } else if (status0 === 1 && status1 === 0) {
    console.log("Spengo Gruppo 0 e Accendo Gruppo 1");
    setSwitch(0, "off");
    setSwitch(1, "on");

  } else if (status0 === 0 && status1 === 1) {
    console.log("Accendo entrambi Gruppi");
    setSwitch(0, "on");
    //setSwitch(1, "on");
  } else if (status0 === 1 && status1 === 1) {
    console.log("Spengo entrambi Gruppi");
    setSwitch(0, "off");
    setSwitch(1, "off");
  }
};

let runCycle = function () {
  console.log("Entro nel runCycle");
  getSwitchStatus(0);
};

let setup = function () {
  Shelly.call(
    "switch.setconfig",
    { id: JSON.stringify(CONFIG.INPUT_ID), config: { in_mode: "detached" } },
    function () {
      Shelly.addEventHandler(function (event) {
        if (event.component === "input:" + JSON.stringify(CONFIG.INPUT_ID)) {
          if (
            event.info.state !== false &&
            event.info.event !== "btn_up" &&
            event.info.event !== "btn_down"
          ) {
            runCycle();
          }
        }
      }, null);
    }
  );
};

setup();