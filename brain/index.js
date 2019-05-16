/**
 * @string type would be categories & would be fixed in the data set, if new category is to be added the model needs to be retrained
 * @number types would be dynamic
 */

const brain = require("brain.js");
const csv = require("csvtojson");

let metadata = {
  schema: {
    V1: { type: "number" },
    V2: { type: "string" },
    V3: { type: "string" },
    V4: { type: "string" },
    V5: { type: "string" },
    V6: { type: "number" },
    V7: { type: "string" },
    V8: { type: "string" },
    V9: { type: "string" },
    V10: { type: "number" },
    V11: { type: "string" },
    V12: { type: "number" },
    V13: { type: "number" },
    V14: { type: "number" },
    V15: { type: "number" },
    V16: { type: "string" },
    Class: { type: "string" }
  },
  target: "Class"
};

// Test input -> 2
let input = {
  V1: "59",
  V2: "admin.",
  V3: "married",
  V4: "secondary",
  V5: "no",
  V6: "2343",
  V7: "yes",
  V8: "no",
  V9: "unknown",
  V10: "5",
  V11: "may",
  V12: "1042",
  V13: "1",
  V14: "-1",
  V15: "0",
  V16: "unknown"
};

function mapEntries(schema) {
  Object.entries(schema).map(([key, value]) => {
    let mappedEntries = {};
    value.entries.map((e, i) => {
      if (value.type === "number") {
        mappedEntries[e] = Number(value.entries[i]);
      } else mappedEntries[e] = (i + 1) * (1 / value.entries.length);
    });
    value.entries = mappedEntries;
  });
  return schema;
}

async function trainModel() {
  let data = await csv().fromFile(process.cwd() + "/datasets/bank-data.csv");

  // Serialize
  data.map(e => {
    Object.entries(e).map(([key, value]) => {
      if (!metadata.schema[key].hasOwnProperty("entries"))
        metadata.schema[key]["entries"] = [];
      if (!metadata.schema[key]["entries"].includes(value))
        metadata.schema[key]["entries"].push(value);
    });
  });
  metadata.schema = mapEntries(metadata.schema);
  // Map
  let mappedDataset = data.map(e => {
    Object.entries(e).map(([key, value]) => {
      e[key] = metadata.schema[key].entries[value];
    });
    return e;
  });

  // Map to predict values
  Object.entries(input).map(([key, value]) => {
    input[key] = metadata.schema[key].entries[value];
  });

  mappedDataset = data.map(e => {
    let ent = { input: {}, output: {} };
    Object.entries(e).map(([key, value]) => {
      if (key === metadata.target) {
        Object.entries(metadata.schema[key].entries).map(([k, v]) => {
          if (v === value) ent["output"][k] = 1;
        });
      } else ent["input"][key] = value;
    });
    return ent;
  });

  const net = new brain.NeuralNetwork();
  // test data
  mappedDataset = mappedDataset.splice(0, 100);

  net.train(mappedDataset, {
    iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
    errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
    log: false, // true to use console.log, when a function is supplied it is used --> Either true or a function
    logPeriod: 10, // iterations between logging out --> number greater than 0
    learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
    momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
    callback: null, // a periodic call back that can be triggered while training --> null or function
    callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
    timeout: Infinity // the max number of milliseconds to train for --> number greater than 0
  });

  const output = net.run(input);
  console.log(output);
}

trainModel();
