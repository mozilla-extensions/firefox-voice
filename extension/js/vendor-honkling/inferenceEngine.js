
class InferenceEngine {
  constructor(config, commands) {
    this.inference_window_ms = config['inference_window_ms']
    this.smoothing_window_ms = config['smoothing_window_ms']
    this.tolerance_window_ms = config['tolerance_window_ms']
    this.inference_weights = config['inference_weights']
    this.inference_sequence = config['inference_sequence']

    this.commands = commands;
    this.num_class = commands.length;

    if (this.num_class != this.inference_weights.length) {
      alert('inference weights and number of commands mismatch');
    }

    // posterior smoothing
    this.pred_history = [];
    this.label_history = [];
  }

  sequencePresent() {
    if (this.inference_sequence.length == 0) return true;

    var d = new Date();
    let curr_time = d.getTime();

    this.label_history = this.dropOldEntries(curr_time, this.label_history, this.inference_window_ms);

    let curr_label = null;
    let target_state = 0;
    let last_valid_timestamp = 0;
    let label = null;
    let curr_timestemp = null;
    let target_label = null;

    for (var i = 0; i < this.label_history.length; i++) {
      label = this.label_history[i][1];
      curr_timestemp = this.label_history[i][0];
      target_label = this.inference_sequence[target_state];


      if (label == target_label) { // move to next entry
        target_state += 1;
        if (target_state == this.inference_sequence.length) { // detected if the last index
          return true;
        }
        
        target_label = this.inference_sequence[target_state];
        curr_label = this.inference_sequence[target_state-1];
        last_valid_timestamp = curr_timestemp;

      } else if (curr_label == label) { // continue with the previous entry
        last_valid_timestamp = curr_timestemp;
      } else if (last_valid_timestamp + this.tolerance_window_ms < curr_timestemp) {
        curr_label = null;
        target_state = 0;
        last_valid_timestamp = 0;
      }
    }

    return false;
  }

  dropOldEntries(curr_time, history_array, window_size) {
    let i;
    for (i = 0; i < history_array.length; i++) {
      if (curr_time - history_array[i][0] < window_size) {
        break;
      }
    }

    return history_array.slice(i, history_array.length);
  }

  accumulateArray(history_array) {
    let accum_history = [];
    for (var j = 0; j < this.num_class; j++) {
      accum_history.push(0);
    }

    for (var i = 0; i < history_array.length; i++) {
      for (var j = 0; j < this.num_class; j++) {
        accum_history[j] += history_array[i][1][j];
      }
    }
    return accum_history;
  }

  argmax(array) {
    let max_ind = 0;
    let max_val = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i] > max_val) {
        max_val = array[i];
        max_ind = i;
      }
    }
    return max_ind;
  }

  getPrediction(curr_time) {
    this.pred_history = this.dropOldEntries(curr_time, this.pred_history, this.smoothing_window_ms);

    this.final_score = this.accumulateArray(this.pred_history);
    let final_pred = this.argmax(this.final_score);
    this.label_history.push([curr_time, final_pred]);
    return final_pred;
  }

  infer(x, model) {
    let pred = model.predict(x);

    let total = 0;

    for (var i = 0; i < this.num_class; i++) {
      pred[i] = pred[i] * this.inference_weights[i];
      total += pred[i];
    }

    for (var i = 0; i < this.num_class; i++) {
      pred[i] = pred[i] / total;
    }

    var d = new Date();
    this.pred_history.push([d.getTime(), pred]);
    let label = this.getPrediction(d.getTime());
    let command = this.commands[label];

    // let raw_pred = this.argmax(pred)
    // console.log(this.commands[raw_pred], command)

    return command
  }
}
