import $ from 'jquery';
import { Subscription, interval } from 'rxjs';
import {
  now,
  cubeTimestampLinearFit,
  GanCubeMove,
  makeTimeFromTimestamp,
} from 'gan-web-bluetooth';


class TimedSolve {
  moves: GanCubeMove[];
  startTime: number;
  duration: number;
  outcome: null | "SOLVED" | "DNF";

  constructor() {
    this.moves = []
    this.startTime = -1;
    this.duration = -1;
    this.outcome = null;
  }

  start() {
    if (this.startTime < 0) {
      this.startTime = now()
    }
  }

  stop() {
    if (this.moves.length > 0){
      var fittedMoves = cubeTimestampLinearFit(this.moves);
      var lastMove = fittedMoves.slice(-1).pop();
      this.duration = lastMove!.cubeTimestamp!
    }
  }

  log(move: GanCubeMove) {
    if (this.startTime < 0) {
      this.start()
    }
    if (this.duration > 0) {
      return
    }
    this.moves.push(move)
  }
}

class TimerView {
  state: "IDLE" | "READY" | "RUNNING" | "STOPPED" = "IDLE"
  localTimer: Subscription | null = null;

  constructor() {
    this.state = "IDLE"
  }

  setState(state: typeof this.state) {
    this.state = state;
    switch (state) {
      case "IDLE":
        this.stopLocalTimer();
        $('#timer').hide();
        break;
      case 'READY':
        this.setValue(0);
        $('#timer').show();
        $('#timer').css('color', '#0f0');
        break;
      case 'RUNNING':
        this.startLocalTimer();
        $('#timer').css('color', '#999');
        break;
      case 'STOPPED':
        this.stopLocalTimer();
        $('#timer').css('color', '#fff');
        break;
    }
  }

  startLocalTimer() {
    var startTime = now();
    this.localTimer = interval(30).subscribe(() => {
      this.setValue(now() - startTime);
    });
  }

  stopLocalTimer() {
    this.localTimer?.unsubscribe();
    this.localTimer = null;
  }

  setValue(timestamp: number) {
    let t = makeTimeFromTimestamp(timestamp);
    $('#timer').html(`${t.minutes}:${t.seconds.toString(10).padStart(2, '0')}.${t.milliseconds.toString(10).padStart(3, '0')}`);
  }
}

export {
  TimedSolve,
  TimerView,
}
