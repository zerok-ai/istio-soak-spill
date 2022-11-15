import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// __ENV = process.env

export const options = {
  discardResponseBodies: true,
  ext: {
    loadimpact: {
      projectID: 3602165,
      // Test runs with the same name groups test runs together
      name: "TEST 1"
    }
  },
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',

      // Our test should last 30 seconds in total
      duration: '60s',

      gracefulStop: '1s',
      // It should start 30 iterations per `timeUnit`. Note that iterations starting points
      // will be evenly spread across the `timeUnit` period.
      rate: 1,

      // It should start `rate` iterations per second
      timeUnit: '1s',

      // It should preallocate 2 VUs before starting the test
      preAllocatedVUs: 2,

      // It is allowed to spin up to 50 maximum VUs to sustain the defined
      // constant arrival rate.
      maxVUs: 50,
    },
  },
};

const host = __ENV.HOST ? 'http://'+__ENV.HOST : "http://localhost"
const port = __ENV.PORT ? __ENV.PORT : "8888"
let status = {
  total: new Rate('ZeroK-rate-total'),
  target: new Rate('ZeroK-rate-target'),
  collector: new Rate('ZeroK-rate-collector'),
  listener: new Rate('ZeroK-rate-listener'),

  total_trend: new Trend('ZeroK-trend-total'),
  target_trend: new Trend('ZeroK-trend-target'),
  collector_trend: new Trend('ZeroK-trend-collector'),
  listener_trend: new Trend('ZeroK-trend-listener')
}

export function setup() {
	console.log("hitting: " + host + ':' + port + '/');
}

export function teardown() {
  console.log(status);
}

export default function () {
  const res = http.get(host+':'+port+'/', { responseType: 'text' } );
  const targetHeader=res.headers["Zerok-Target"] || 'Service';
  // console.log(targetHeader)

  // check(res, {
  //   'target': (r) => r.body.includes('completed'),
  // });
  // if(res.body.includes('completed')) {
  //   status.total.add(1);
  //   status.total_trend.add(res.timings.duration);
  // }
  
  if(targetHeader.includes('collector')) {
    status.collector.add(1);
    status.listener.add(0);
    status.target.add(0);
    status.collector_trend.add(res.timings.duration);
  } else if(targetHeader.includes('listener')) {
    status.collector.add(0);
    status.listener.add(1);
    status.target.add(0);
    status.listener_trend.add(res.timings.duration);
  } else {
    status.collector.add(0);
    status.listener.add(0);
    status.target.add(1);
    status.target_trend.add(res.timings.duration);
  }
}

